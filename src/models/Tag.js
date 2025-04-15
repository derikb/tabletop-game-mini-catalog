
export default class Tag {
    #id = 0;
    #name = '';
    #figure_count = 0;

    constructor({
        id = 0,
        name = '',
        figure_count = 0,
    }) {
        this.#id = Number(id);
        this.#name = name;
        this.#figure_count = Number(figure_count);
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

    setName (name) {
        this.#name = name;
    }

    getCount () {
        return this.#figure_count;
    }

    toJSON () {
        return {
            id: this.#id,
            name: this.#name,
            figure_count: this.#figure_count,
        };
    }

    toInsertArray () {
        return [
            this.#name,
        ];
    }
};
