import fs from 'node:fs/promises';

const getHead = function (
    title,
) {
    return `<head>
        <title>Miniature Catalog: ${title}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        <style>
            label { font-weight: bold; }
        </style>
        <script src="/js/index.js" type="module"></script>
    </head>`;
};

const getPages = function () {
    return [
        {
            path: '/',
            label: 'Home',
        },
        {
            path: '/new',
            label: 'Add Figure',
        },
        {
            path: '/tags',
            label: 'Manage Tags',
        },
        {
            path: '/makers',
            label: 'Manage Makers',
        }
    ];
};

const getNavItems = function (current = '') {
    return getPages().map(
        (el) => {
            return `
            <li class="nav-item">
                <a class="nav-link ${el.path === current ? 'active' : ''}" href="${el.path}">${el.label}</a>
            </li>
            `;
        }
    ).join('');
};

const getFrame = function (
    title,
    path,
    content,
) {
    return `
    <!DOCTYPE html>
    <html lang="en-US">
        ${getHead(title)}
    <body>
        <div class="container">
            <h1>Miniature Catalog: ${title}</h1>
            <ul class="nav">
                ${getNavItems(path)}
            </ul>
            <hr class="mb-3" />
            ${content}
        </div>
    </body>
    </html>
    `;
};

const getContent = async function (filename) {
    return await fs.readFile(`${import.meta.dirname}/../public/${filename}.html`, { encoding: 'utf8' });
};

const getPage = async function (title, path, filename) {
    return await getFrame(title, path, (await getContent(filename)).toString());
};

export {
    getPage,
};
