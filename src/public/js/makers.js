
let makerTable = null;
let allMakers = null;

const loadMakers = async function () {
    try {
        const response = await fetch(
            '/makers/all',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        const { makers = [] } = await response.json();
        allMakers = makers;
    } catch (err) {
        console.log(err);
        allMakers = [];
    }
};

const addMakersToPage = async function () {
    if (allMakers === null) {
        await loadMakers();
    }
    allMakers.forEach((m) => {
        addMakerToTable(m);
    });
};

const addMakerToTable = function ({ id = 0, name = '', figure_count = 0 }) {
    if (id <= 0 || !name) {
        return;
    }
    if (makerTable) {
        makerTable.insertAdjacentHTML('beforeend', makerRow({ id, name, figure_count }));
    }
};

const makerRow = function ({ id = 0, name = '', figure_count = 0 }) {
    if (id <= 0 || !name) {
        return '';
    }
    return `<tr id="maker-${id}">
        <td>${name}</td>
        <td>${figure_count}</td>
        <td>
            <button type="button" class="btn btn-danger btn-maker-delete" data-id="${id}">Delete</button>
        </td>
    </tr>`;
};

const addMakersToSelect = async function() {
    const select = document.querySelector('#figure-maker_id');
    if (!select) {
        return;
    }
    if (allMakers === null) {
        await loadMakers();
    }
    allMakers.forEach((maker) => {
        const option = document.createElement('option');
        option.value = maker.id;
        option.innerText = maker.name;
        option.selected = true;
        select.appendChild(option);
    });
};

const addMaker = async function (ev) {
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
    const { maker = null } = await response.json();
    if (maker) {
        allMakers.push(maker);
        form.reset();
        return maker;
    }
    return null;
};

const deleteMaker = async function(makerId) {
    const response = await fetch(
        `/maker/${makerId}/delete`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
        }
    );
    const { success = false } = await response.json();
    if (success) {
        makerTable.querySelector(`#maker-${makerId}`)?.remove();

        const index = allMakers.findIndex((m) => {
            return m.id === makerId;
        });
        if (index > -1) {
            allMakers.splice(index, 1);
        }
    }
};

const initMakerPage = async function () {
    makerTable = document.querySelector('#table-makers tbody');

    const addMakerDialog = document.getElementById('modal-maker-add');
    document.getElementById('btn-maker-add')?.addEventListener('click', () => {
        addMakerDialog?.showModal();
    });

    const addForm = document.getElementById('maker-add');
    addForm?.addEventListener('submit', async (ev) => {
        const maker = await addMaker(ev);
        addMakerDialog.close();
        if (maker) {
            addMakerToTable(maker);
        }
    });

    await addMakersToPage();

    document.body.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button');
        if (!btn) {
            return;
        }
        if (btn.classList.contains('btn-maker-delete')) {
            const makerId = btn.dataset.id || 0;
            deleteMaker(makerId);
        }
        if (btn.classList.contains('btn-dialog-close')) {
            ev.preventDefault();
            btn.closest('dialog')?.close();
        }
    });
};

export {
    loadMakers,
    addMakersToSelect,
    addMaker,
    initMakerPage,
};
