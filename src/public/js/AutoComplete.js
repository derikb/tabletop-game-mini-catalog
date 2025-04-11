/**
 * Autocomplete/Typeahead.
 */
export default class AutoComplete {
    constructor({
        input = null,
        queryUrl = '',
        staticData = [],
        queryProcessor = null,
        dataProcessor = null,
        selectCallback = null,
        resultLimit = 10,
        queryData = {},
        instructionsText = '{{count}} options available. Use up and down arrows to browse available options and enter to select one.',
        preventSubmit = false,
        listLabel = 'Suggested results',
        showAllOnFocus = false,
        allowEmptySearch = false
    }) {
        /** @prop {HTMLElement} input Text input. */
        this.input = input;
        if (!this.input) {
            return;
        }
        /** @param {String} queryUrl Url to send ajax requests to */
        this.queryUrl = queryUrl;
        /** @prop {Array} staticData Data to use instead of querying a url. */
        this.staticData = staticData;
        if (!this.queryUrl && this.staticData.length === 0) {
            throw new Error('Must set queryUrl or staticData.');
        }
        /** @prop {Function} queryProcessor Escapes or otherwise transforms typed data for query. */
        this.queryProcessor = (typeof queryProcessor === 'function') ? queryProcessor : null;
        /** @prop {Function} dataProcessor Transforms returned data. */
        this.dataProcessor = (typeof dataProcessor === 'function') ? dataProcessor : null;
        /** @prop {Function} selectCallback When an option is selected, this will run with the selected option as its arg. */
        this.selectCallback = (typeof selectCallback === 'function') ? selectCallback : null;
        /** @prop {Number} resultLimit Number of items to show. */
        this.resultLimit = Number(resultLimit);
        /** @prop {Object} queryData Data to send with the query. Could be strings OR HTML input to retrieve values from. */
        this.queryData = queryData;
        /** @prop {String} instructionsText Text for screen reader instructions. */
        this.instructionsText = instructionsText;
        /** @prop {Boolean} preventSubmit Should we prevent form submission on "enter" in input. */
        this.preventSubmit = !!preventSubmit;
        /** @prop {String} listLabel Aria description for the list. */
        this.listLabel = listLabel;
        /** @prop {Boolean} showAllOnFocus When focused the autocomplete will show the list for "all" (i.e. a blank search) */
        this.showAllOnFocus = !!showAllOnFocus;
        /** @prop {Boolean} allowEmptySearch Is a blank/empty search allowed (i.e. show all). */
        this.allowEmptySearch = !!allowEmptySearch;
        if (this.showAllOnFocus) {
            this.allowEmptySearch = true;
        }
        /** @prop {HTMLElement} list Autocomplete list. */
        this.list = null;
        /** @prop {HTMLElement} instructions Screen reader instructions. */
        this.instructions = null;
        /** @prop {Function} throttle Timeout function for throttling requests */
        this.throttle = null;
        /** @prop {Object} xhrSearch Current search request object. */
        this.xhrSearch = null;
        /** @prop {String} queryName Name of the query param from this.input['name'] */
        this.queryName = '';
        /** @prop {String} typedQuery The query as typed. */
        this.typedQuery = '';
    }
    init () {
        this.formatInput();
        this.createList();
        this.addInstructions();
        this.attachEvents();
    }
    /**
     * Clear the input element of text.
     */
    clearInput() {
        this.input.value = '';
    }
    /**
     * Select the next list item.
     */
    selectNext() {
        const current = this.list.querySelector('li[aria-selected=true]');
        let selected = null;
        if (current === null) {
            selected = this.list.querySelector('li:first-of-type');
            if (selected === null) {
                return;
            }
        } else {
            selected = current.nextElementSibling;
            if (selected === null) {
                return;
            }
            current.setAttribute('aria-selected', false);
        }

        selected.setAttribute('aria-selected', true);
        this.input.value = selected.textContent;
    }
    /**
     * Select the previous list item
     */
    selectPrevious() {
        const current = this.list.querySelector('li[aria-selected=true]');
        if (current === null) {
            return;
        }
        const selected = current.previousElementSibling;
        if (selected === null) {
            this.input.value = this.typedQuery;
        } else {
            selected.setAttribute('aria-selected', true);
            this.input.value = selected.textContent;
        }
        current.setAttribute('aria-selected', false);
    }
    /**
     * Select an item via clicking on it.
     * @param {HTMLElement} selected Option in list.
     */
    selectByClick(selected) {
        const prevSelected = this.list.querySelector('li[aria-selected=true]');
        if (prevSelected !== null) {
            prevSelected.setAttribute('aria-selected', false);
        }
        selected.setAttribute('aria-selected', true);
        this.selectOption();
        if (!this.showAllOnFocus) {
            this.input.focus();
        }
    }
    /**
     * Escape query for use in regex.
     * Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
     * Should be in some kind of utility module probably, but there is not one of those at this time.
     * @param {String} string String to escape.
     * @return {String}
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    /**
     * Format data object into HTMLElement
     * @param {Object} object Data object.
     * @return {HTMLElement|null}
     */
    formatOption(object) {
        let display = '';
        if (object.display) {
            display = object.display;
        } else {
            const regex = new RegExp(`(${this.escapeRegExp(this.typedQuery)})`, 'ig');
            display = object.label.replace(regex, '<strong>$1</strong>');
        }
        if (!display) {
            return null;
        }

        const option = document.createElement('li');
        option.setAttribute('aria-selected', false);
        option.setAttribute('role', 'option');
        Object.keys(object).forEach((prop) => {
            if (prop === 'label' || prop === 'display') {
                return;
            }
            option.dataset[prop] = object[prop];
        });
        option.innerHTML = display;
        return option;
    }
    /**
     * Display results.
     * @param {Array} data Array of data objects.
     */
    displayResults(data) {
        if (data.length === 0) {
            this.closeList();
            return;
        }

        let options = data.map(this.formatOption, this);
        if (options.length > this.resultLimit && !this.allowEmptySearch) {
            options = options.slice(0, this.resultLimit);
        }
        this.list.innerHTML = '';

        const fragment = document.createDocumentFragment();
        options.forEach((element) => {
            if (!element) {
                return;
            }
            fragment.appendChild(element);
        });

        this.list.appendChild(fragment);
        this.updateInstructions(options.length);
        this.openList();
    }
    /**
     * Is the list open
     * @return {Boolean}
     */
    isListOpen() {
        return !this.list.classList.contains('d-none');
    }
    /**
     * Is one of the options selected.
     * @return {Boolean}
     */
    isOptionSelected() {
        return this.list.querySelector('li[aria-selected=true]') !== null;
    }
    /**
     * Open the list.
     */
    openList() {
        this.list.style.left = `${this.input.offsetLeft}px`;
        this.list.style.top = `${this.input.offsetTop + this.input.offsetHeight}px`;
        this.list.style.minWidth = `${this.input.offsetWidth}px`;
        this.list.classList.remove('d-none');
        this.input.setAttribute('aria-expanded', true);
    }
    /**
     * Close the list
     */
    closeList() {
        this.list.classList.add('d-none');
        this.list.innerHTML = '';
        this.input.setAttribute('aria-expanded', false);
        this.updateInstructions(0);
    }
    /**
     * Select one of the list options.
     */
    selectOption() {
        const option = this.list.querySelector('li[aria-selected=true]');
        this.input.dataset.oldvalue = this.input.value;
        this.input.value = option.textContent;
        if (this.selectCallback !== null) {
            this.selectCallback(option);
        }
        this.closeList();
    }
    /**
     * Process the results if necessary.
     * Should have:
     * label text value of the item
     * display (optional) display html for the list
     * @param {Object|Array} data Data from the server.
     * @return {Array}
     */
    processData(data) {
        if (this.dataProcessor !== null) {
            return this.dataProcessor(data);
        }
        return data;
    }
    /**
     * Build a query string.
     * @return {String}
     */
    buildQueryString() {
        const rawTyped = this.input.value;
        const query = (this.queryProcessor !== null) ? this.queryProcessor(rawTyped) : rawTyped;
        const params = new URLSearchParams();
        params.append(this.queryName, query);
        params.append('limit', this.resultLimit);

        const props = Object.keys(this.queryData);
        props.forEach(function(prop) {
            const value = this.queryData[prop];
            if (typeof value === 'function') {
                // dynamic param
                params.append(prop, value());
                return;
            }
            params.append(prop, value);
        }, this);
        return `?${params.toString()}`;
    }
    /**
     * On load for ajax request.
     */
    xhrOnLoad() {
        if (this.xhrSearch.status >= 200 && this.xhrSearch.status < 400) {
            // Success!
            const data = JSON.parse(this.xhrSearch.responseText);
            const formattedData = this.processData(data);
            this.displayResults(formattedData);
        } else {
            // We reached our target server, but it returned an error
            console.log(this.xhrSearch.statusText);
        }
    }
    /**
     * xhr error.
     */
    xhrOnError() {
        // There was a connection error of some sort
        console.log(this.xhrSearch.statusText);
    }
    /**
     * The ajax request.
     */
    makeRequest() {
        const queryString = this.buildQueryString();

        this.xhrSearch = new XMLHttpRequest();
        this.xhrSearch.open('GET', this.queryUrl + queryString, true);
        this.xhrSearch.setRequestHeader('Accept', 'application/json');
        this.xhrSearch.onload = this.xhrOnLoad.bind(this);
        this.xhrSearch.onerror = this.xhrOnError.bind(this);
        this.xhrSearch.send();
    }
    /**
     * Search the static data.
     */
    searchData() {
        const rawTyped = this.input.value;
        if (rawTyped === '' && !this.allowEmptySearch) {
            this.closeList();
            return;
        }
        let query = (this.queryProcessor !== null) ? this.queryProcessor(rawTyped) : rawTyped;
        query = query.toLowerCase();
        if (query === '') {
            this.displayResults(this.staticData);
            return;
        }
        const results = this.staticData.filter((option) => {
            return option.label.toLowerCase().indexOf(query) !== -1;
        });
        this.displayResults(results);
    }
    /**
     * Get exact match.
     * For when submitted without choosing the dropdown.
     * Only works with when staticData is set.
     * @returns {Object|null}
     */
    getExactMatch() {
        const rawTyped = this.input.value.trim().toLowerCase();
        if (rawTyped === '') {
            return null;
        }
        const result = this.staticData.find((option) => {
            return option.label.toLowerCase() === rawTyped;
        });
        if (!result) {
            return null;
        }
        return result;
    }
    /**
     * Inititiate a search.
     */
    query() {
        if (this.staticData.length > 0) {
            this.searchData();
            return;
        }
        if (this.throttle) {
            clearTimeout(this.throttle);
        }
        if (this.xhrSearch) {
            this.xhrSearch.abort();
        }
        if (this.input.value === '' && !this.allowEmptySearch) {
            this.closeList();
            return;
        }
        this.throttle = setTimeout(this.makeRequest.bind(this), 500);
    }
    /**
     * Destroy. Remove events, etc.
     */
    disable() {
        this.list.parentNode.removeChild(this.list);
        // this.input reset attributes, remove listeners
    }
    /**
     * Create the list to hold the results
     */
    createList() {
        this.list = document.createElement('ul');
        this.list.id = this.getListId();
        this.list.setAttribute('role', 'listbox');
        this.list.setAttribute('aria-label', this.listLabel);
        this.list.classList.add('autocomplete-list');
        this.list.classList.add('d-none');
        // insert list after input
        this.input.parentNode.insertBefore(this.list, this.input.nextSibling);
    }
    /**
     * The list id based on the input id.
     * @return {String}
     */
    getListId() {
        return `${this.input.id}_list`;
    }
    /**
     * The instruction id based on the input id.
     * @return {String}
     */
    getInstructionsId() {
        return `${this.input.id}_instructions`;
    }
    /**
     * Add appropriate attributes to the input.
     */
    formatInput() {
        this.input.setAttribute('role', 'combobox');
        this.input.setAttribute('aria-autocomplete', 'list');
        this.input.setAttribute('aria-expanded', 'false');
        this.input.setAttribute('aria-controls', this.getListId());
        this.input.setAttribute('aria-describedby', this.getInstructionsId());
        this.input.setAttribute('autocomplete', 'off');
        this.queryName = this.input.getAttribute('name');
    }
    /**
     * Update instructions with number of options found.
     * @param {Number} count Number of options.
     */
    updateInstructions(count) {
        this.instructions.innerHTML = this.instructionsText.replace('{{count}}', count);
    }
    /**
     * Handler: Key down typing in the input, handles special commands.
     * @param {Event} ev Keyup event.
     */
    handleTypingDown(ev) {
        const open = this.isListOpen();
        switch (ev.key) {
            case 'Escape':
                // if list is open, close it.
                if (open) {
                    this.closeList();
                }
                break;
            case 'ArrowDown':
                // if list is open, navigate to/select first entry.
                if (open) {
                    ev.preventDefault();
                    this.selectNext();
                } else if (this.showAllOnFocus && this.input.value === '') {
                    this.query();
                }
                break;
            case 'ArrowUp':
                // if list is open, navigate to/select first entry.
                if (open) {
                    ev.preventDefault();
                    this.selectPrevious();
                }
                break;

            case 'Enter':
                if (open && this.isOptionSelected()) {
                    ev.preventDefault();
                    this.selectOption();
                } else if (this.preventSubmit) {
                    ev.preventDefault();
                }
                break;
            case 'Tab':
                if (open && this.isOptionSelected()) {
                    this.selectOption();
                } else if (open) {
                    this.closeList();
                }
                // default action
                break;
        }
    }
    /**
     * Handler: Key up typing in the input. Does the search
     * @param {Event} ev Keyup event.
     */
    handleTypingUp(ev) {
        switch (ev.key) {
            case 'Escape':
            case 'ArrowDown':
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'Enter':
            case 'Tab':
                // ignore
                break;
            default:
                this.typedQuery = this.input.value;
                this.query();
                break;
        }
    }
    /**
     * Click events on the list of results.
     * @param {Event} ev Click event.
     */
    handleClick(ev) {
        const li = ev.target.closest('li[aria-selected=false]');
        if (li === null) {
            return;
        }
        this.selectByClick(li);
        return;
    }
    /**
     * Clicks on the document will close the list if outside the list or input itself.
     * @param {Event} ev Click event.
     */
    handleOutsideClick(ev) {
        const target = ev.target;
        if (target.closest(`#${this.list.id}`) === null && target.closest(`#${this.input.id}`) === null) {
            // click target is outside autocomplete
            this.closeList();
            return;
        }
    }
    /**
     * Attach events.
     */
    attachEvents() {
        this.input.addEventListener('keydown', this.handleTypingDown.bind(this));
        this.input.addEventListener('keyup', this.handleTypingUp.bind(this));
        this.list.addEventListener('click', this.handleClick.bind(this));

        // Warning: This handler will not get removed if the autocomplate is removed from the page
        // Ideally we should remove it, but that would require a MutationObserver that basically watches the whole page
        // Since the parent of the autoomplete isn't always the one that is explicitly removed (and thus wouldn't trigger the observer).
        document.body.addEventListener('click', this.handleOutsideClick.bind(this));

        if (this.showAllOnFocus) {
            this.input.addEventListener('focus', () => {
                if (this.input.value === '') {
                    this.query();
                }
            });
        }
    }
    /**
     * Add instructions div.
     */
    addInstructions() {
        this.instructions = document.createElement('div');
        this.instructions.id = this.getInstructionsId();
        this.instructions.setAttribute('aria-live', 'polite');
        this.instructions.classList.add('visually-hidden');
        this.instructions.innerHTML = this.instructionsText.replace('{{count}}', 0);

        this.list.parentNode.insertBefore(this.instructions, this.list.nextSibling);
    }
}
