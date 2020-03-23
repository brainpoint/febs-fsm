
Finite state machine.

此状态机不存在一个当前状态, 当前状态必须由处理事件时指定;
使用此状态机可以降低重复初始化状态机的开销.

`State 对象的成员属性, 独立于状态机; 不可认为是状态的信息`

# usage

### Define event.

```js
import {State, StateEvent, StateMechine} from '@/libs/stateMechine/concurrent';

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
    this.addTransition(new Event2(), new State2());
  }

  async onEnter( ctx:any, event:StateEvent, preStateIdentify:string ):Promise<any> {}
  async onLeave( ctx:any, event:StateEvent, nextStateIdentify:string ):Promise<void> {}
  async onProcess( ctx:any, event:StateEvent, nextStateIdentify:string ):Promise<{transition:boolean, ret?:any}> {}
}
// State2.
class State2 extends State {
  constructor() {
    super('State2');
    this.addTransition(new Event1(), new State1());
  }

  async onEnter( ctx:any, event:StateEvent, preStateIdentify:string ):Promise<any> {}
  async onLeave( ctx:any, event:StateEvent, nextStateIdentify:string ):Promise<void> {}
  async onProcess( ctx:any, event:StateEvent, nextStateIdentify:string ):Promise<{transition:boolean, ret?:any}> {}
}
```

### Initiate mechine.

```js
class Mechine extends StateMechine {
  constructor() {
    super();
    this.addState(new State1());
    this.addState(new State2());
  }
}

let mechine = new Mechine();
```

### Process event.

```js
mechine.process_event(currentStateIdentify, ctx, new Event1()) // will transition to state2.
```
