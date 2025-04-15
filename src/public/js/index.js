import { initAddForm, initFigureTable } from './figure.js';
import { initMakerPage } from './makers.js';
import { initTagPage } from './tags.js';

const initPage = async function () {
    const path = location.pathname;
    switch (path) {
        case '/':
        case '':
            initFigureTable();
            break;
        case '/new':
        case '/edit':
            initAddForm();
            break;
        case '/tags':
            await initTagPage();
            break;
        case '/makers':
            await initMakerPage();
            break;
        default:
            break;
    }
};

if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
