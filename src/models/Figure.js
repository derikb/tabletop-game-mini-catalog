
export default class Figure {
    #id = 0;
    #name = '';
    #maker_id = 0;
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
        maker_id = 0,
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
        this.#maker_id = maker_id;
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

    getMakerId () {
        return this.#maker_id;
    }

    setMakerId (id) {
        this.#maker_id = id;
    }

    getCount () {
        return this.#count;
    }

    getScale () {
        return this.#scale;
    }

    getBuilt () {
        return this.#built;
    }

    getPrimed () {
        return this.#primed;
    }

    getPainted () {
        return this.#painted;
    }

    getMaterial () {
        return this.#material;
    }

    getBaseShape () {
        return this.#base_shape;
    }

    getBaseSize () {
        return this.#base_size;
    }

    getTagIds () {
        return this.#tagIds;
    }

    setTagIds (tagIds) {
        this.#tagIds = tagIds;
    }

    updateFromForm ({
        name = '',
        maker_id = 0,
        count = 0,
        scale = '',
        built = 0,
        primed = 0,
        painted = 0,
        material = '',
        base_shape = '',
        base_size = '',
        tag_ids = [],
    }) {
        this.#name = name;
        this.#maker_id = maker_id;
        this.#count = count;
        this.#scale = scale;
        this.#built = built;
        this.#primed = primed;
        this.#painted = painted;
        this.#material = material;
        this.#base_shape = base_shape;
        this.#base_size = base_size;
        this.#tagIds = tag_ids.map((el) => { return Number(el); }).filter((e) => e);
    }

    toJSON () {
        return {
            id: this.#id,
            name: this.#name,
            maker_id: this.#maker_id,
            count: this.#count,
            scale: this.#scale,
            built: this.#built,
            primed: this.#primed,
            painted: this.#painted,
            material: this.#material,
            base_shape: this.#base_shape,
            base_size: this.#base_size,
            tag_ids: this.#tagIds,
        };
    }

    // Note changing this means changing insertFigure and updateFigure...
    toInsertArray () {
        return [
            this.#name,
            this.#maker_id,
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
