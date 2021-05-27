# js-event-tracker
## Summary
This utility tracks helps track # of events in the past x seconds (up to 5 minutes in the past).

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

setTimeout(() => {
    myEvent();
}, 1000);

```

## Testing
### Run Unit Tests
Tests will compile any code changes in `./src` before running
```
npm run test
```