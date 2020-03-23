
Finite state machine.

此状态机存在一个当前状态,可以用于单个特定环境; 例如: 聊天室,独立副本等; 

# usage

### Define event.

```js
import {State, StateEvent, StateMechine} from '@/libs/stateMechine/standard';

// Event1.
class Event1 extends StateEvent {
  data1: number;

  constructor() {
    super('Event1');
  }
}
// Event2.
class Event2 extends StateEvent {
  data2: number;

  constructor() {
    super('Event2');
  }
}
```

### Define state.

```js
// State1.
class State1 extends State {
  constructor() {
    super('State1');
    this.addTransition('Event2', 'State2');
  }

  async onEnter( event:StateEvent, preState:State ):Promise<any> {}
  async onLeave( event:StateEvent, nextState:State ):Promise<void> {}
  async onProcess( event:StateEvent, nextState:State ):Promise<{transition:boolean, ret?:any}> {}
}
// State2.
class State2 extends State {
  constructor() {
    super('State2');
    this.addTransition('Event1', 'State1');
  }

  async onEnter( event:StateEvent, preState:State ):Promise<any> {}
  async onLeave( event:StateEvent, nextState:State ):Promise<void> {}
  async onProcess( event:StateEvent, nextState:State ):Promise<{transition:boolean, ret?:any}> {}
}
```

### Initiate mechine.

```js
class Mechine extends StateMechine {
  constructor() {
    super('State1');
    this.addState(new State1());
    this.addState(new State2());
  }
}

let mechine = new Mechine();
await mechine.initiate();
```

### Process event.

```js
mechine.process_event(new Event1()) // will transition to state2.
```
