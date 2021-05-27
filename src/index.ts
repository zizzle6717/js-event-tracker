import * as constants from './constants';
import EventTrackerBase, { IEventTrackerBaseOptions } from './EventTrackerBase';

interface IEventTrackerOptions extends IEventTrackerBaseOptions {
    maxBucketSize?: number;
    store?: any;
}

interface IBucketDataIndexMap {
    timestamp: number;
    eventCount: number;
    accumulativeCount: number;
}

export const bucketDataIndexMap: IBucketDataIndexMap = {
    timestamp: 0,
    eventCount: 1,
    accumulativeCount: 2,
};

class EventTracker extends EventTrackerBase {
    #count = 0;
    #store: any;
    #maxBucketSize = constants.DEFAULT_MAX_BUCKET_SIZE;

    get store() {
        return this.#store;
    }

    constructor(options: IEventTrackerOptions) {
        super({
            name: options.name,
        });

        // We could replace store with an external cache, but that's not in the scope of the requirements
        this.#store = options.store || {};
        this.#maxBucketSize = options.maxBucketSize || constants.DEFAULT_MAX_BUCKET_SIZE;
    }

    add = () => {
        this.#count += 1;
        const timestampSeconds = Math.round(Date.now() / 1000);
        const bucketKeys = Object.keys(this.#store);
        const latestBucketKey = bucketKeys[bucketKeys.length - 1];
        if (!latestBucketKey) {
            // Create first bucket
            this.#store[timestampSeconds] = [[timestampSeconds, 1, this.#count]];
        } else {
            const bucket = this.#store[latestBucketKey];
            const timestampIndex = bucketDataIndexMap.timestamp;
            const eventCountIndex = bucketDataIndexMap.eventCount;
            const accumulativeCountIndex = bucketDataIndexMap.accumulativeCount;

            // Increment event count for timestamp (to the nearest 1 second) if it already exists
            if (bucket[bucket.length - 1][timestampIndex] === timestampSeconds) {
                bucket[bucket.length - 1][eventCountIndex] += 1;
                bucket[bucket.length - 1][accumulativeCountIndex] = this.#count;
            } else if (bucket.length < this.#maxBucketSize) {
                const data: any[] = [];
                data[timestampIndex] = timestampSeconds;
                data[eventCountIndex] = 1;
                data[accumulativeCountIndex] = this.#count;
                bucket.push(data);
            } else {
                // Create next bucket when latest bucket is full
                this.#store[timestampSeconds] = [[timestampSeconds, 1, this.#count]];
            }
        }
    }

    get count() {
        return this.#count;
    }
}

export default EventTracker;
