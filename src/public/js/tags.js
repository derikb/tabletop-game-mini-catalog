
let tagTable = null;
let allTags = null;

const loadTags = async function () {
    try {
        const response = await fetch(
            '/tags/all',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        const { tags = [] } = await response.json();
        allTags = tags;
    } catch (err) {
        console.log(err);
        allTags = [];
    }
};

const addTagsToPage = async function () {
    if (allTags === null) {
        await loadTags();
    }
    allTags.forEach((t) => {
        addTagToTable(t);
    });
};

const addTagToTable = function ({ id = 0, name = '', figure_count = 0 }) {
    if (id <= 0 || !name) {
        return;
    }
    if (tagTable) {
        tagTable.insertAdjacentHTML('beforeend', tagRow({ id, name, figure_count }));
    }
};

const tagRow = function ({ id = 0, name = '', figure_count = 0 }) {
    if (id <= 0 || !name) {
        return '';
    }
    return `<tr id="tag-${id}">
        <td>${name}</td>
        <td>${figure_count}</td>
        <td>
            <button type="button" class="btn btn-danger btn-tag-delete" data-id="${id}">Delete</button>
        </td>
    </tr>`;
};

const addNewTag = async function (ev) {
    ev.preventDefault();
    const form = ev.target;
    const data = new FormData(form);
    const response = await fetch(
        form.action,
        {
            method: form.method,
            body: JSON.stringify(Object.fromEntries(data)),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }
    );
    const { tag = null } = await response.json();
    if (tag) {
        allTags.push(tag);
        form.reset();
        return tag;
    }
    return null;
};

const deleteTag = async function(tagId) {
    const response = await fetch(
        `/tag/${tagId}/delete`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
        }
    );
    const { success = false } = await response.json();
    if (success) {
        tagTable.querySelector(`#tag-${tagId}`)?.remove();

        const index = allTags.findIndex((t) => {
            return t.id === tagId;
        });
        if (index > -1) {
            allTags.splice(index, 1);
        }
    }
};

/**
 * Spans for tags applied to figure.
 * @param {Array<Number>} tagIds
 */
const getTagsSpans = function (tagIds = []) {
    if (allTags === null) {
        loadTags();
    }
    const tags = [];
    tagIds.forEach((id) => {
        const tag = allTags.find((t) => t.id === id );
        if (tag) {
            tags.push(`<span>${tag.name}</span>`);
        }
    });

    return tags.join(' ');
};

const initTagPage = async function () {
    tagTable = document.querySelector('#table-tags tbody');

    const addTagDialog = document.getElementById('modal-tag-add');
    document.getElementById('btn-tag-add')?.addEventListener('click', () => {
        addTagDialog?.showModal();
    });

    const addForm = document.getElementById('tag-add');
    addForm?.addEventListener('submit', async (ev) => {
        const tag = await addNewTag(ev);
        addTagDialog.close();
        if (tag) {
            addTagToTable(tag);
        }
    });

    await addTagsToPage();

    document.body.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button');
        if (!btn) {
            return;
        }
        if (btn.classList.contains('btn-tag-delete')) {
            const tagId = Number(btn.dataset.id || 0);
            deleteTag(tagId);
        }
        if (btn.classList.contains('btn-dialog-close')) {
            ev.preventDefault();
            btn.closest('dialog')?.close();
        }
    });
};

const getTags = async function () {
    if (allTags === null) {
        await loadTags();
    }
    return allTags;
};

export {
    initTagPage,
    loadTags,
    addTagsToPage,
    getTagsSpans,
    getTags,
    addNewTag,
};
