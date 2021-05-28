import EventTracker from '../src';

console.log('-- SCALE TEST RESULTS --');

const eventsPerSecond = 1000000;
let count = 0;

console.time('control-group-1-million-count');
for (let i = 0; i < eventsPerSecond; i += 1) {
    count += 1;
}
console.timeEnd('control-group-1-million-count');

count = 0; // cleanup

const testEventTracker = new EventTracker({ name: 'test' });

console.time('event-tracker-1-million-events');
for (let i = 0; i < eventsPerSecond; i += 1) {
    testEventTracker.add();
}
console.timeEnd('event-tracker-1-million-events');

console.time('time-to-count-all');
const totalEventCount = testEventTracker.getEventCount(10);
console.timeEnd('time-to-count-all');
console.log(`...total event count: ${totalEventCount}`);

setTimeout(() => {
    for (let i = 0; i < eventsPerSecond + 1; i += 1) {
        testEventTracker.add();
    }

    console.time('time-to-search-and-count-all');
    const eventCount = testEventTracker.getEventCount(1);
    console.timeEnd('time-to-search-and-count-all');
    console.log(`...partial event count: ${eventCount}`);

    if (totalEventCount + 1 !== eventCount) {
        console.error('\n!!!');
        console.error('!!!');
        console.error('!!! Error in accuracy of count. Partial count should return eventsPerSecond test variable plus 1 !!!');
        console.error('!!!');
        console.error('!!!\n');
    }

    console.time('time-to-search-and-count-all-1million-times');
    for (let i = 0; i < eventsPerSecond; i += 1) {
        testEventTracker.getEventCount(1);
    }
    console.timeEnd('time-to-search-and-count-all-1million-times');

    process.exit();
}, 2000);
