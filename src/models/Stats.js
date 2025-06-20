export default class Stats {
    #entries = 0;
    #figures = 0;
    #built = 0;
    #primed = 0;
    #painted = 0;

    constructor({
        entries = 0,
        figures = 0,
        built = 0,
        primed = 0,
        painted = 0,
    }) {
        this.#entries = Number(entries);
        this.#figures = Number(figures);
        this.#built = Number(built);
        this.#primed = Number(primed);
        this.#painted = Number(painted);
    }

    getEntries() {
        return this.#entries;
    }

    getFigures() {
        return this.#figures;
    }

    getBuilt() {
        return this.#built;
    }

    getPrimed() {
        return this.#primed;
    }

    getPainted() {
        return this.#painted;
    }

    toJSON () {
        return {
            entries: this.#entries,
            figures: this.#figures,
            built: this.#built,
            primed: this.#primed,
            painted: this.#painted,
        };
    }
};
