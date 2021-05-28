import EventTracker from '../src';

console.log('-- BEGINNING STRESS TESTING --');

const eventsPerSecond = 1000000;
const searchRequestsPerSecond = 100;

const maxTimeSpan = 300;

let testEventTracker: any = new EventTracker({
    name: 'test',
    maxTimeSpan, // 5 minutes
});

let searchTimeoutId;

const intervalId = setInterval(() => {
    for (let i = 0; i < eventsPerSecond; i += 1) {
        testEventTracker.add();
    }

    searchTimeoutId = setTimeout(() => {
        for (let i = 0; i < searchRequestsPerSecond; i += 1) {
            if (i === searchRequestsPerSecond - 1) {
                console.time('Duration of getEventCount search/request: ');
            }
            testEventTracker.getEventCount();
            if (i === searchRequestsPerSecond - 1) {
                console.timeEnd('Duration of getEventCount search/request: ');
            }
        }
    }, 500);
}, 1000);

const countIntervalId = setInterval(() => {
    const countInLast3MinuteSpan = testEventTracker.getEventCount(180);
    const totalCountForSupportedSpan = testEventTracker.getEventCount(maxTimeSpan);
    console.log('countInLast3MinuteSpan', countInLast3MinuteSpan);
    console.log('totalCountForSupportedSpan', totalCountForSupportedSpan);
}, 1000 * 10);

setTimeout(() => {
    clearInterval(intervalId);
    clearTimeout(searchTimeoutId);
    clearInterval(countIntervalId);
    testEventTracker.stopGarbageCollection();
    console.log(testEventTracker.store);
    testEventTracker = null;
    process.exit();
}, 1000 * 60 * 11); // Run for 10 minutes plus some extra time padding
