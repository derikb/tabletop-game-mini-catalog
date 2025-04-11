
let tagList = null;
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
    const select = document.querySelector('#figure-tag_ids, #tag-list');
    if (!select) {
        return;
    }
    allTags.forEach((t) => {
        addTagToList(t, select);
    });
};

const tagTemp = function ({ id = 0, name = '' }) {
    return `<li id="tag-${id}">${name} <button type="button" class="btn-tag-delete" data-id="${id}">Delete</button></li>`;
};

const addTagToList = function ({ id = 0, name = '' }, list) {
    if (id <= 0 || !name) {
        return;
    }
    if (list.tagName === 'UL') {
        list.insertAdjacentHTML('beforeend', tagTemp({ id, name }));
    }
    if (list.tagName === 'SELECT') {
        const opt = tagOption({ id, name });
        if (opt) {
            list.appendChild(opt);
        }
    }
};

const tagOption = function ({ id = 0, name = '' }) {
    if (id <= 0 || !name) {
        return null;
    }
    const opt = document.createElement('option');
    opt.value = id ?? 0;
    opt.innerText = name;
    return opt;
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
        tagList.querySelector(`#tag-${tagId}`)?.remove();

        const index = allTags.findIndex((t) => {
            return t.id === tagId;
        });
        if (index > -1) {
            allTags.splice(index, 1);
        }
    }
};

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
    tagList = document.getElementById('tag-list');

    const addForm = document.getElementById('tag-add');
    addForm?.addEventListener('submit', async (ev) => {
        const tag = await addNewTag(ev);
        if (tag) {
            addTagToList(tag, tagList);
        }
    });

    await addTagsToPage();

    tagList.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button');
        if (!btn) {
            return;
        }
        if (btn.classList.contains('btn-tag-delete')) {
            const tagId = Number(btn.dataset.id || 0);
            deleteTag(tagId);
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
