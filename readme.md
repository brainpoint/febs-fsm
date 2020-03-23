
# Finite state machine.

## Install

```js
npm i febs-fsm
```

`write in Typescript`.

## Example

```js
import {
  State, 
  StateEvent, 
  StateMechine
} from 'febs-fsm';

// Define Event1.
class Event1 extends StateEvent {
  constructor() {
    super('Event1');
  }
}

// Define State1.
class State1 extends State {
  constructor() {
    super('State1');
    this.addTransition('Event1', 'State2');
  }
  async onProcess( event:StateEvent, nextState:State ):Promise<{transition:boolean, ret?:any}> {
    return {transition: true};
  }
}

// Define State2.
class State2 extends State {
  constructor() {
    super('State2');
  }
  async onProcess( event:StateEvent, nextState:State ):Promise<{transition:boolean, ret?:any}> {
    return {transition: false};
  }
}


// Define mechine.
class Mechine extends StateMechine {
  constructor() {
    super('State1');  // init state identify.
    this.addState(new State1());
    this.addState(new State2());
  }
}

let mechine = new Mechine();
await mechine.initiate(); // initiate.
mechine.process_event(new Event1());  // process_event.
```

## Standard FSM

[standard](./lib/standard/readme.md): Store current state in mechine object. This applies to situations such as chat rooms.

```js
import {
  State, 
  StateEvent, 
  StateMechine
} from 'febs-fsm';
```

### Concurrent FSM

[concurrent](./lib/concurrent/readme.md): Use the FSM concurrently. It isnot store current state in mechine object. Use context to pass the current state to FSM. Avoidance of repetition to set up FSM object.

```js
import {
  State, 
  StateEvent, 
  StateMechine
} from 'febs-fsm/concurrent';
```

### Identify

The Identify of state or event use string name:

```js
// State1.
class State1 extends State {
  get identify():string { return 'State1'; }
}
```

### State process flow

1. Execute `curState.onProcess`. It will do as follow, if function return `{transition:true, ret?:any}`.
2. Execute `curState.onLeave`
3. Change curState to nextState.
3. Execute `nextState.onEnter`

#### onProcess: {transition:boolean, ret:any}

  - transition: Indicates whether can to transition to nextState.
  - ret: Any value

#### onEnter: any
  - return a any value.

It will return the `'onEnter return value'` or `'onProcess.ret'`,  When call `process_event`.
