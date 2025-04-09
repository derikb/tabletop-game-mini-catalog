

const loadMakers = async function() {
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
    makers.forEach((t) => {
        addMakerToList(t);
    });
};

const addMakerToList = function(maker) {
    const select = document.querySelector('#figure-maker_id, #maker-list');
    if (!select) {
        return;
    }
    if (select.tagName === 'SELECT') {
        const option = document.createElement('option');
        option.value = maker.id;
        option.innerText = maker.name;
        option.selected = true;
        select.appendChild(option);
        return;
    }
    select.insertAdjacentHTML('beforeend', makerTemp(maker));
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
        addMakerToList(maker);
        form.reset();
        form.closest('dialog')?.close();
    }
};

const makerTemp = function ({ id = 0, name = '' }) {
    return `<li id="maker-${id}">${name} <button type="button" class="btn-maker-delete" data-id="${id}">Delete</button></li>`;
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
        const makerList = document.querySelector('#maker-list');
        makerList?.querySelector(`#maker-${makerId}`)?.remove();
    }
};


const initMakerPage = function () {
    const makerList = document.getElementById('maker-list');

    const addForm = document.getElementById('maker-add');
    addForm?.addEventListener('submit', addMaker);

    loadMakers();

    makerList.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button');
        if (!btn) {
            return;
        }
        if (btn.classList.contains('btn-maker-delete')) {
            const makerId = btn.dataset.id || 0;
            deleteMaker(makerId);
        }
    });
};

export {
    loadMakers,
    addMakerToList,
    addMaker,
    initMakerPage,
};
