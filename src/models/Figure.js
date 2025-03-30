
export default class Figure {
    #id = 0;
    #name = '';
    #manufacturer = '';
    #count = 1;
    #scale = 28;
    #built = 0;
    #primed = 0;
    #painted = 0;
    #material = '';
    #base_shape = '';
    #base_size = '';
    #added = null;
    #updated = null;
    #tagIds = [];

    constructor({
        id = 0,
        name = '',
        manufacturer = '',
        count = 1,
        scale = 28,
        built = 0,
        primed = 0,
        painted = 0,
        material = '',
        base_shape = '',
        base_size = '',
        added = null,
        updated = null,
        tag_ids = [],
    }) {
        this.#id = id;
        this.#name = name;
        this.#manufacturer = manufacturer;
        this.#count = count;
        this.#scale = scale;
        this.#built = built;
        this.#primed = primed;
        this.#painted = painted;
        this.#material = material;
        this.#base_shape = base_shape;
        this.#base_size = base_size;
        this.#added = added;
        this.#updated = updated;
        this.#tagIds = tag_ids.map((el) => { return Number(el); }).filter((e) => e);
    }

    getId () {
        return this.#id;
    }

    setId (id) {
        this.#id = id;
    }

    getName () {
        return this.#name;
    }

    getManufacturer () {
        return this.#manufacturer;
    }

    getTagIds () {
        return this.#tagIds;
    }

    setTagIds (tagIds) {
        this.tagIds = tagIds;
    }

    toJSON () {
        return {
            id: this.#id,
            name: this.#name,
        };
    }

    toInsertArray () {
        return [
            this.#name,
            this.#manufacturer,
            this.#count,
            this.#scale,
            this.#built,
            this.#primed,
            this.#painted,
            this.#material,
            this.#base_shape,
            this.#base_size,
        ]
    }
};
