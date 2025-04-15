import AutoComplete from './AutoComplete.js';
import { addMaker, addMakersToSelect } from './makers.js';
import { getTags, getTagsSpans, loadTags, addNewTag } from './tags.js';

let addForm = null;

const getTagBadge = function ({ id = 0, name = '' }) {
    return `
    <span class="badge text-bg-secondary">
        <input type="hidden" name="tag_ids" value="${id}" />${name}
        <a href="#" class="icon-link link-light btn-tag-remove ms-2"><i class="bi bi-x-circle-fill"></i></a>
    </span>
    `;
};

const loadFigures = async function(table) {
    const response = await fetch(
        '/figures/all',
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }
    );
    const { figures = [] } = await response.json();
    figures.forEach((f) => {
        const tr = document.createElement('tr');
        tr.dataset.figureid = f.id;
        tr.innerHTML = `
            <td>${f.id}</td>
            <td>${f.name}</td>
            <td>${f.count}</td>
            <td>${f.maker_name}</td>
            <td>${getTagsSpans(f.tag_ids)}</td>
            <td><a href="/edit?figure_id=${f.id}" class="me-2">Edit</a>
                <a href="#" class="btn-figure-delete">Delete</a></td>
        `;
        table.appendChild(tr);
    });
};


const loadFigure = async function(figure_id) {
    const response = await fetch(
        `/figure/${figure_id}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }
    );
    const { figure = null } = await response.json();
    if (!figure) {
        return;
    }

    addForm?.reset();
    for(const [key, val] of Object.entries(figure)) {
        const input = addForm?.elements[key] || null;
        if (!input) {
            continue;
        }
        switch(input.type) {
            case 'select-one':
                input.value = val;
                break;
            case 'select-multiple':
                Array.from(input.options).forEach((option) => {
                    if (val.includes(Number(option.value))) {
                        option.selected = true;
                    } else {
                        option.selected = false;
                    }
                });
                break;
            case 'checkbox':
                input.checked = !!val;
                break;
            default:
                input.value = val;
                break;
        }
    }

    const tags = await getTags();
    figure.tag_ids.forEach((id) => {
        const tag = tags.find((t) => {
            return t.id === id;
        });
        if (!tag) {
            return;
        }
        const badge = getTagBadge(tag);
        addForm.querySelector('#figure-tags').insertAdjacentHTML('beforeend', badge);
    });
};


const handleForm = async function (ev) {
    ev.preventDefault();
    const form = ev.target;
    const data = new FormData(form);
    const formObject = Object.fromEntries(data);
    formObject.tag_ids = data.getAll('tag_ids');
    try {
        const figureId = data.get('id') || 0;
        const response = await fetch(
            `${form.action}${figureId > 0 ? `/${figureId}` : ''}`,
            {
                method: form.method,
                body: JSON.stringify(formObject),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        if (!response.ok) {
            const { message = '' } = await response.json();
            alert(message);
            return;
        }
        alert('Success!');
    } catch (err) {
        console.log(err.message);
    }
};

const deleteFigure = async function(figureId) {
    const response = await fetch(
        `/figure/${figureId}/delete`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
        }
    );
    const { id = 0 } = await response.json();
    if (id > 0) {
        document.querySelector(`tr[data-figureid="${id}"]`)?.remove();
    }
};

const initTagAutoComplete = function (tags) {
    const input = document.getElementById('figure-tag_ids');
    const staticData = tags.map(({ id, name }) => {
        return {
            label: name,
            id,
        };
    });
    const auto = new AutoComplete({
        input,
        staticData,
        selectCallback: (option) => {
            // insert an input with label
            const value = option.dataset.id || 0;
            if (addForm.querySelector(`input[name="tag_ids"][value="${value}"]`)) {
                return;
            }
            addForm.querySelector('#figure-tags').insertAdjacentHTML('beforeend', getTagBadge({ id: value, name: option.innerText }));
            auto.clearInput();
        },
    });
    auto.init();
};

const removeTag = function (button) {
    button.closest('.badge')?.remove();
};

const initAddForm = async function () {
    addForm = document.getElementById('figure-add');
    addForm?.addEventListener('submit', handleForm);

    const tags = await getTags();
    initTagAutoComplete(tags);

    await addMakersToSelect();

    const addMakerDialog = document.getElementById('modal-maker-add');
    document.getElementById('btn-maker-add')?.addEventListener('click', () => {
        addMakerDialog?.showModal();
    });

    const addTagDialog = document.getElementById('modal-tag-add');
    document.getElementById('btn-tag-add')?.addEventListener('click', () => {
        addTagDialog?.showModal();
    });

    document.getElementById('maker-add').addEventListener('submit', addMaker);

    document.getElementById('tag-add').addEventListener('submit', async (ev) => {
        const tag = await addNewTag(ev);
        addTagDialog.close();
        if (!tag) {
            return;
        }
        // add to figure
        addForm.querySelector('#figure-tags').insertAdjacentHTML('beforeend', getTagBadge(tag));
    });

    // make sure tags and makers (or any other loaded options)
    // are loaded before this.
    const params = new URLSearchParams(window.location.search);
    if (params.get('figure_id') > 0) {
        const figureId = params.get('figure_id');
        loadFigure(figureId);
    }

    document.body.addEventListener('click', (ev) => {
        const btn =['BUTTON', 'A'].includes(ev.target.tagName)
            ? ev.target
            : ev.target.closest('button, a');
        if (!btn) {
            return;
        }
        if (btn.classList.contains('btn-tag-remove')) {
            ev.preventDefault();
            removeTag(btn);
            return;
        }
        if (btn.classList.contains('btn-dialog-close')) {
            ev.preventDefault();
            btn.closest('dialog')?.close();
        }
    });
};

const initFigureTable = async function () {
    const table = document.querySelector('#figures-list tbody');

    table.addEventListener('click', (ev) => {
        if (ev.target.closest('.btn-figure-delete')) {
            const tr = ev.target.closest('tr');
            const id = tr?.dataset?.figureid || 0;
            if (id > 0) {
                deleteFigure(id);
            }
        }
    });

    await loadTags();
    await loadFigures(table);
};

export {
    initAddForm,
    initFigureTable,
};
