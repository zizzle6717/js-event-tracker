import { expect } from 'chai';
import EventTracker, { bucketDataIndexMap } from '../src';

describe('EventTracker', () => {
    it('increments count for each event with an accuracy of 1 second', (done) => {
        const testEventTracker = new EventTracker({
            name: 'test',
            store: {},
        });

        testEventTracker.add();
        testEventTracker.add();
        testEventTracker.add();

        setTimeout(() => {
            testEventTracker.add();
            testEventTracker.add();

            const bucketKey = Object.keys(testEventTracker.store)[0];
            expect(testEventTracker.store[bucketKey][0][bucketDataIndexMap.eventCount]).to.be.equal(3);
            expect(testEventTracker.store[bucketKey][1][bucketDataIndexMap.eventCount]).to.be.equal(2);

            done();
        }, 1000);
    });

    it('creates a new bucket when maxBucketSize is exceeded on the previous bucket', (done) => {
        const testEventTracker = new EventTracker({
            maxBucketSize: 1,
            name: 'test',
        });

        // Bucket 1
        for (let i = 0; i < 20; i += 1) {
            testEventTracker.add();
        }

        // Bucket 2
        setTimeout(() => {
            testEventTracker.add();
            testEventTracker.add();

            // Bucket 3
            setTimeout(() => {
                testEventTracker.add();
                testEventTracker.add();
                testEventTracker.add();
                testEventTracker.add();
                testEventTracker.add();

                const bucketKeys = Object.keys(testEventTracker.store);
                const bucketKey = Object.keys(testEventTracker.store)[0];
                const bucket1Key = Object.keys(testEventTracker.store)[1];
                const bucket2Key = Object.keys(testEventTracker.store)[2];
                expect(bucketKeys.length).to.be.equal(3);
                expect(testEventTracker.store[bucketKey][0][bucketDataIndexMap.eventCount]).to.be.equal(20);
                expect(testEventTracker.store[bucketKey][1]).to.be.equal(undefined);
                expect(testEventTracker.store[bucket1Key][0][bucketDataIndexMap.eventCount]).to.be.equal(2);
                expect(testEventTracker.store[bucket1Key][1]).to.be.equal(undefined);
                expect(testEventTracker.store[bucket2Key][0][bucketDataIndexMap.eventCount]).to.be.equal(5);
                expect(testEventTracker.store[bucket2Key][1]).to.be.equal(undefined);
            }, 1000);

            done();
        }, 1000);
    });
});
