/* eslint-disable quote-props */
import { expect } from 'chai';
import sinon from 'sinon';
import EventTracker, { bucketDataIndexMap } from '../src';

describe('EventTracker', () => {
    describe('constructor', () => {
        it('throws error when maxBucketSize is greater than maxTimeSpan', () => {
            const instantiate = () => new EventTracker({
                name: 'test',
                maxBucketSize: 301,
                maxTimeSpan: 300,
            });
            expect(instantiate).to.throw('maxBucketSize cannot be greater than maxTimeSpan');
        });
    });

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
        it('returns 0 when store is empty', () => {
            const testEventTracker = new EventTracker({
                maxBucketSize: 1,
                name: 'test',
            });

            const actual = testEventTracker.getEventCount(300);
            expect(actual).to.be.equal(0);
        });

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
                startRecord: [1622143932, 4, 25],
            });

            expect(actual).to.be.equal(29);
        });
    });

    describe('getFirstRecord', () => {
        it('finds the next record after the start time', () => {
            const mockStore = {
                '1622143932': [
                    [1622143932, 2, 2],
                    [1622143934, 1, 3],
                    [1622143935, 2, 5],
                ],
            };
            const mockStartTime = 1622143933;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(mockStore['1622143932'][1]);
        });

        it('search is inclusive of matching timestamp', () => {
            const mockStore = {
                '1622143932': [
                    [1622143932, 2, 2],
                    [1622143934, 1, 3],
                    [1622143935, 2, 5],
                ],
                '1622143937': [
                    [1622143937, 2, 7],
                    [1622143939, 4, 12],
                    [16221439340, 3, 15],
                ],
            };
            const mockStartTime = 1622143937;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(mockStore['1622143937'][0]);
        });

        it('search has a fallover to the next bucket and first record', () => {
            const mockStore = {
                '1622143932': [
                    [1622143932, 2, 2],
                    [1622143934, 1, 3],
                    [1622143935, 2, 5],
                ],
                '1622143937': [
                    [1622143937, 2, 7],
                    [1622143939, 4, 12],
                    [16221439340, 3, 15],
                ],
            };
            const mockStartTime = 1622143936;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(mockStore['1622143937'][0]);
        });

        it('starts count from beginning of store when start time is less then first bucket/event timestamp', () => {
            const mockStore = {
                '1622043920': [
                    [1622043920, 2, 2],
                    [1622043923, 1, 3],
                    [1622043924, 2, 5],
                ],
                '1622143932': [
                    [1622143932, 2, 7],
                    [1622143934, 1, 8],
                    [1622143935, 2, 10],
                ],
            };
            const mockStartTime = 1621043920;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            const firstBucketKey = Object.keys(mockStore)[0];
            expect(actual).to.be.deep.equal(mockStore[firstBucketKey][0]);
        });

        it('returns null when no relevant record is found', () => {
            const mockStore = {
                '1622143932': [
                    [1622143932, 2, 2],
                    [1622143934, 1, 3],
                    [1622143935, 2, 5],
                ],
            };
            const mockStartTime = 1622143936;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(null);
        });

        it('returns null when store is empty', () => {
            const mockStore = {};
            const mockStartTime = 1622143936;

            const actual = EventTracker.getFirstRecord(mockStore, mockStartTime);
            expect(actual).to.be.deep.equal(null);
        });
    });

    describe('getGCStartIndex', () => {
        it('does not include index of data within valid tracking range', () => {
            const mockMaxTimeSpan = 300;
            const timeStampBeforeSpan = EventTracker.getFirstTimestampOutOfRange(mockMaxTimeSpan);
            const mockStore = {
                [timeStampBeforeSpan]: [
                    [timeStampBeforeSpan, 1, 1],
                ],
                [timeStampBeforeSpan + 1]: [
                    [timeStampBeforeSpan + 3, 1, 2],
                ],
            };
            const mockBucketKeys = Object.keys(mockStore);

            const expected = 0;
            const actual = EventTracker.getGCStartIndex(mockStore, timeStampBeforeSpan, mockBucketKeys);
            expect(actual).to.be.equal(expected);
            const expected2 = -1;
            const actual2 = EventTracker.getGCStartIndex(mockStore, timeStampBeforeSpan - 1, mockBucketKeys);
            expect(actual2).to.be.equal(expected2);
            const expected3 = 1;
            const actual3 = EventTracker.getGCStartIndex(mockStore, timeStampBeforeSpan + 1, mockBucketKeys);
            expect(actual3).to.be.equal(expected3);
        });
    });

    describe('collectGarbage', () => {
        it('removes old bucket data from store', () => {
            const mockStartIndex = 3;
            const getGCStartIndexStub = sinon.stub(EventTracker, 'getGCStartIndex').returns(mockStartIndex);
            const eventTracker = new EventTracker({
                name: 'test',
            });
            const deleteBucketSpy = sinon.spy(eventTracker, 'deleteBucket');

            eventTracker.collectGarbage();

            expect(getGCStartIndexStub.calledOnce).to.be.equal(true);
            expect(deleteBucketSpy.callCount).to.be.equal(mockStartIndex + 1);
            sinon.restore();
        });
    });
});
