# js-event-tracker
## Summary
This utility tracks helps track # of events in the past x seconds.

defaults:
* Up to 5 minutes in the past (configurable with `maxTimeSpan`)

## Build/Compile
This command will output to the `./dist` directory
```
npm run build
```
## Basic Usage
```ts
/* import EventTracker from 'js-event-tracker'; */
import EventTracker from './js-event-tracker/dist';

const myEventTracker = new EventTracker({
    name: 'my-event-tracker'
});

function myEvent() {
    myEventTracker.add();
    console.log('This is a mock event');
}

myEvent();
myEvent();
myEvent();

setTimeout(() => {
    myEvent();
}, 1000);

setTimeout(() => {
    myEvent();
}, 5000);

setTimeout(() => {
    myEventTracker.getEventCount(3); // 3 seconds in the past, returns a count of 4
}, 2000);


setTimeout(() => {
    myEvent();
    myEventTracker.getEventCount(10); // 10 seconds in the past, returns a count of 6
    myEventTracker.getEventCount(2); // 1 seconds in the past, returns a count of 1
}, 6000);

```

## Testing
### Run Unit Tests
Tests will compile any code changes in `./src` before running
```
npm run test
```
Run unit tests with coverage:
```
npm run test:coverage
```