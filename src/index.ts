import * as config from './config';
import EventTrackerBase, { IEventTrackerBaseOptions } from './EventTrackerBase';
import quickSearchNearest from './utilities/quickSearchNearest';

interface IEventTrackerOptions extends IEventTrackerBaseOptions {
    gcIntervalMs?: number;
    maxBucketSize?: number;
    maxTimeSpan?: number;
    store?: any;
}

interface IBucketDataIndexMap {
    timestamp: number;
    eventCount: number;
    cumulativeCount: number;
}

export const bucketDataIndexMap: IBucketDataIndexMap = {
    timestamp: 0,
    eventCount: 1,
    cumulativeCount: 2,
};

class EventTracker extends EventTrackerBase {
    #count = 0;
    #store: any;
    #gcIntervalMs = config.GARBAGE_COLLECTION_INTERVAL_MS;
    #maxBucketSize = config.DEFAULT_MAX_BUCKET_SIZE;
    #maxTimeSpan = config.MAX_TIMESPAN_SECONDS;
    #gcIntervalId;
    static calculateCountWithinTimespan: ({
        currentTotal,
        startRecord,
    }) => number;
    static getFirstRecord: (store, startTimeSeconds: number) => any[];
    static getFirstTimestampOutOfRange: (maxTimeSpan: number) => number;
    static getGCStartIndex: (store, startTimeSeconds: number, bucketKeys: string[]) => number;
    get store() {
        return this.#store;
    }

    constructor(options: IEventTrackerOptions) {
        super({
            name: options.name,
        });

        // We could replace store with an external cache, but that's not in the scope of the requirements
        this.#store = options.store || {};
        this.#gcIntervalMs = options.gcIntervalMs || config.GARBAGE_COLLECTION_INTERVAL_MS;
        this.#maxBucketSize = options.maxBucketSize || config.DEFAULT_MAX_BUCKET_SIZE;
        this.#maxTimeSpan = options.maxTimeSpan || config.MAX_TIMESPAN_SECONDS;

        if (this.#maxBucketSize > this.#maxTimeSpan) {
            // This prevents garbage collection from trashing a bucket with data that is withing maxTimeSpan
            throw new Error('maxBucketSize cannot be greater than maxTimeSpan');
        }

        this.#gcIntervalId = setInterval(() => {
            this.startGarbageCollection();
        }, this.#gcIntervalMs);
    }

    add() {
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
            const cumulativeCountIndex = bucketDataIndexMap.cumulativeCount;

            // Increment event count for timestamp (to the nearest 1 second) if it already exists
            if (bucket[bucket.length - 1][timestampIndex] === timestampSeconds) {
                bucket[bucket.length - 1][eventCountIndex] += 1;
                bucket[bucket.length - 1][cumulativeCountIndex] = this.#count;
            } else if (bucket.length < this.#maxBucketSize) {
                const data: any[] = [];
                data[timestampIndex] = timestampSeconds;
                data[eventCountIndex] = 1;
                data[cumulativeCountIndex] = this.#count;
                bucket.push(data);
            } else {
                // Create next bucket when latest bucket is full
                this.#store[timestampSeconds] = [[timestampSeconds, 1, this.#count]];
            }
        }

        // TODO: Garbage Collect (total count and old store buckets)
        // NOTE: Changing total count will throw off event count calculation
        // ... and not chopping down will cause eventual memory leak
    }

    // intervalSeconds: Number of seconds in the past to start count
    getEventCount(intervalSeconds: number = this.#maxTimeSpan) {
        // eslint-disable-next-line no-param-reassign
        intervalSeconds = intervalSeconds > this.#maxTimeSpan ? this.#maxTimeSpan : intervalSeconds;
        const nowSec = Math.round(Date.now() / 1000);
        const startSeconds = nowSec - Math.round(intervalSeconds); // prevent decimal inputs
        const startRecord = EventTracker.getFirstRecord(this.#store, startSeconds);

        if (!startRecord) {
            return 0;
        }

        return EventTracker.calculateCountWithinTimespan({
            currentTotal: this.#count,
            startRecord,
        });
    }

    startGarbageCollection() {
        this.#gcIntervalId = setInterval(() => {
            this.collectGarbage();
        });
    }

    stopGarbageCollection() {
        clearInterval(this.#gcIntervalId);
    }

    collectGarbage() {
        const startSeconds = EventTracker.getFirstTimestampOutOfRange(this.#maxTimeSpan);
        const bucketKeys = Object.keys(this.#store);
        const latestCollectibleBucketKeyIndex = EventTracker.getGCStartIndex(this.#store, startSeconds, bucketKeys);

        if (latestCollectibleBucketKeyIndex !== -1) {
            for (let i = latestCollectibleBucketKeyIndex; i >= 0; i -= 1) {
                this.deleteBucket(bucketKeys[i]);
            }
        }
    }

    deleteBucket(bucketKey) {
        delete this.#store[bucketKey];
    }
}

/* STATIC METHODS */
// Because event count is included in the cumulative count, subtract before finding the difference between total count and start point count
EventTracker.calculateCountWithinTimespan = ({
    currentTotal,
    startRecord,
}) => currentTotal - (startRecord[bucketDataIndexMap.cumulativeCount] - startRecord[bucketDataIndexMap.eventCount]);

EventTracker.getFirstRecord = (store, startTimeSeconds) => {
    const bucketKeys = Object.keys(store);
    if (!bucketKeys.length) {
        return null;
    }
    const startBucketKeyIndex = quickSearchNearest(bucketKeys, startTimeSeconds, 'prev', {
        normalizeValue: (val) => Number(val),
    });
    let startBucketKey = bucketKeys[startBucketKeyIndex === -1 ? 0 : startBucketKeyIndex];
    let startRecordIndex = quickSearchNearest(store[startBucketKey], startTimeSeconds, 'next', {
        arrValueIndex: bucketDataIndexMap.timestamp,
    });

    // Start count at first record of next bucket
    if (startRecordIndex === -1) {
        if (!bucketKeys[startBucketKeyIndex + 1]) {
            return null;
        }

        startBucketKey = bucketKeys[startBucketKeyIndex + 1];
        startRecordIndex = 0;
    }

    return store[startBucketKey][startRecordIndex];
};

// 1 additional second less than the maxTimeSpan to prevent garbage collecting event data within valid range
EventTracker.getFirstTimestampOutOfRange = (maxTimeSpan) => (Math.floor(Date.now() / 1000)) - maxTimeSpan - 1;

EventTracker.getGCStartIndex = (store, startTimeSeconds, bucketKeys) => quickSearchNearest(bucketKeys, startTimeSeconds, 'prev', {
    normalizeValue: (val) => Number(val),
});

export default EventTracker;
