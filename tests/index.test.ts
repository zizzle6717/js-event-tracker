/* eslint-disable quote-props */
import { expect } from 'chai';
import EventTracker, { bucketDataIndexMap } from '../src';

describe('EventTracker', () => {
    describe('add', () => {
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

    describe('getEventCount', () => {
        it('returns total events in the past n seconds to the nearest 1 second', (done) => {
            const EVENTS_PER_LOOP = 20;
            const DIFFERENTIATOR_COUNT = 7;
            const testEventTracker = new EventTracker({
                maxBucketSize: 1,
                name: 'test',
            });

            // Bucket 1
            for (let i = 0; i < EVENTS_PER_LOOP; i += 1) {
                testEventTracker.add();
            }
            for (let i = 0; i < DIFFERENTIATOR_COUNT; i += 1) {
                testEventTracker.add();
            }

            setTimeout(() => {
                // Bucket 2
                for (let i = 0; i < EVENTS_PER_LOOP; i += 1) {
                    testEventTracker.add();
                }

                const expected = EVENTS_PER_LOOP * 2 + DIFFERENTIATOR_COUNT;
                const expected2 = EVENTS_PER_LOOP * 1;

                const actual = testEventTracker.getEventCount(4);
                expect(actual).to.be.equal(expected);

                const actual2 = testEventTracker.getEventCount(2);
                expect(actual2).to.be.equal(expected2);

                done();
            }, 3000);
        }).timeout(3250);
    });

    describe('calculateCountWithinTimespan', () => {
        it('factors the already accumulated event count for the start record into the calculation', () => {
            const actual = EventTracker.calculateCountWithinTimespan({
                currentTotal: 50,
                startRecord: [1622143110932, 4, 25],
            });

            expect(actual).to.be.equal(29);
        });
    });

    describe('getFirstRecord', () => {
        it('finds the next record after the start time', () => {
            const mockStore = {
                '1622143110932': [
                    [1622143110932, 2, 2],
                    [1622143110934, 1, 3],
                    [1622143110935, 2, 5],
                ],
            };
            const mockStartTime = 1622143110933;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(mockStore['1622143110932'][1]);
        });

        it('search is inclusive of matching timestamp', () => {
            const mockStore = {
                '1622143110932': [
                    [1622143110932, 2, 2],
                    [1622143110934, 1, 3],
                    [1622143110935, 2, 5],
                ],
                '1622143110937': [
                    [1622143110937, 2, 7],
                    [1622143110939, 4, 12],
                    [16221431109340, 3, 15],
                ],
            };
            const mockStartTime = 1622143110937;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(mockStore['1622143110937'][0]);
        });

        it('search has a fallover to the next bucket and first record', () => {
            const mockStore = {
                '1622143110932': [
                    [1622143110932, 2, 2],
                    [1622143110934, 1, 3],
                    [1622143110935, 2, 5],
                ],
                '1622143110937': [
                    [1622143110937, 2, 7],
                    [1622143110939, 4, 12],
                    [16221431109340, 3, 15],
                ],
            };
            const mockStartTime = 1622143110936;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(mockStore['1622143110937'][0]);
        });

        it('starts count from beginning of store when start time is less then first bucket/event timestamp', () => {
            const mockStore = {
                '1622142810920': [
                    [1622142810920, 2, 2],
                    [1622142810923, 1, 3],
                    [1622142810924, 2, 5],
                ],
                '1622143110932': [
                    [1622143110932, 2, 7],
                    [1622143110934, 1, 8],
                    [1622143110935, 2, 10],
                ],
            };
            const mockStartTime = 1622142810800;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            const firstBucketKey = Object.keys(mockStore)[0];
            expect(actual).to.be.deep.equal(mockStore[firstBucketKey][0]);
        });

        it('returns null when no relevant record is found', () => {
            const mockStore = {
                '1622143110932': [
                    [1622143110932, 2, 2],
                    [1622143110934, 1, 3],
                    [1622143110935, 2, 5],
                ],
            };
            const mockStartTime = 1622143110936;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(null);
        });

        it('returns null when store is empty', () => {
            const mockStore = {};
            const mockStartTime = 1622143110936;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(null);
        });
    });
});
