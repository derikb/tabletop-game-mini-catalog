
let statsList = null;
let allStats = null;

const loadStats = async function () {
    try {
        const response = await fetch(
            '/stats/all',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        const { stats = [] } = await response.json();
        allStats = stats;
    } catch (err) {
        console.log(err);
        allStats = [];
    }
};

const addStatsToPage = async function () {
    if (allStats === null) {
        await loadStats();
    }
    Object.keys(allStats).forEach((key) => {
        addStatToList(key, allStats[key]);
    });
};

// @todo fix this file
const addStatToList = function (stat = '', value = '') {
    if (id <= 0 || !name) {
        return;
    }
    if (statsList) {
        statsList.insertAdjacentHTML('beforeend', makerRow({ id, name, figure_count }));
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

const initStatsPage = async function () {
    statsList = document.querySelector('#stats-list');
    await addStatsToPage();
};

export {
    initStatsPage,
};
