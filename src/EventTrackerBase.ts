import { v4 as uuidv4 } from 'uuid';

export interface IEventTrackerBaseOptions {
    name: string;
}

class EventTrackerBase {
    #name;
    #id;

    constructor(options: IEventTrackerBaseOptions) {
        this.#name = options.name;
        this.#id = uuidv4();
    }

    get name() {
        return this.#name;
    }

    get id() {
        return this.#id;
    }
}

export default EventTrackerBase;
