# js-event-tracker
## Summary
This utility helps record and search # of events in the past x seconds. It can be used to log each event as a count in memory and retrieve the # of events for a requested span of seconds in the past.

defaults (set in `src/config.ts` file):
* Up to 5 minutes in the past (configurable with `maxTimeSpan`)
* Up to 10 buckets over the span of 5 minutes
* Garbage collection occurs on an interval of every 2.5 minutes

<br/><br/>
## Build/Compile
This command will output to the `./dist` directory
```
npm run build
```
<br/><br/>
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

<br/><br/>
## Additional Documentation/Notes
* Options interface for class constructor:
```
interface IEventTrackerOptions extends IEventTrackerBaseOptions {
    gcIntervalMs?: number;
    maxBucketSize?: number;
    maxTimeSpan?: number;
    store?: any;
}
export interface IEventTrackerBaseOptions {
    name: string;
}

const exampleEventTracker = new EventTracker(options: IEventTrackerOptions);

```
* `name` is the only required property
* Use `eventTracker.id` to get a uuid for the tracker or `eventTracker.name` to get the name you have applied to the tracker
* The EventTracker class has a built in garbage collector that runs on a setInterval. After a tracker is no longer needed, it's imported to clear the interval by calling `eventTracker.stopGarbageCollection()`. This will remove any closure that would otherwise keep the class around in memory.

<br/><br/>
## Testing
### Run Unit Tests
Tests will compile any code changes in `./src` before running.

Run all tests (w/ coverage)
```
npm run test
```
Run unit tests only:
```
npm run test:unit
```
Run unit tests only, and with coverage:
```
npm run test:unit:coverage
```
Run some basic benchmark/scale tests
```
npm run test:scale
```
Begin the stress tests and load `chrome://inspect` in the browser. This will allow live inspection through chrome dev-tools. Here we can check for a memory leak, check the console for a recurring log of the count, gather heap snapshots, etc.
```
npm run test:stress
```