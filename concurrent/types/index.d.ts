

//--------------------------------------------------------
// class of StateEvent
//--------------------------------------------------------
/**
* @desc: 状态事件, 可以使用这个类传递参数. 
*/
export declare class StateEvent {
  constructor(identify:string);

  /**
  * @desc: 获得在状态机中的标识.
  */
  get identify():string;
}

//--------------------------------------------------------
// class of State
//--------------------------------------------------------

/**
* @desc: 简单状态.
*/
export declare abstract class State {
  constructor(identify:string);

  /**
  * @desc: 获得在状态机中的标识.
  */
  get identify():string;

  /**
  * @desc: 获得所在的状态机. 如果当前不能进行状态转移此值会为null, 当可以进行状态转移时会变为非空.
  */
  get mechine():StateMechine;

  /**
  * @desc: 添加状态转换 (状态机启动后, 不允许添加).
  */
  addTransition(event:StateEvent, state:State):void;

  /**
  * @desc: 查询指定事件对应要转换到的状态 identify.
  */
  getTransition(event:any):string;

  /**
   * @desc: enter the state. 状态机已经完成了状态切换, 可以继续调用StateMechine.process_event触发状态切换.
   */
  abstract onEnter( ctx:any, event:StateEvent, preStateIdentify:string ):Promise<any>;

  /**
   * @desc: leave the state. 即将进入下一状态, 故无法调用StateMechine.process_event触发状态切换.
   */
  abstract onLeave( ctx:any, event:StateEvent, nextStateIdentify:string ):Promise<void>;

  /**
   * @desc: 当前状态处理事件. 每个事件在处理时, 都会交由当前状态处理.
   * @param nextState 表明当前状态处理完event后要转移的下一个状态;
   *                  如果此值不为null,则存在状态转转移, 故无法调用StateMechine.process_event触发状态切换.
   * @return transition表明是否可以进行状态转移; ret是允许返回给用户的任意值.
   */
  abstract onProcess( ctx:any, event:StateEvent, nextStateIdentify:string ):Promise<{transition:boolean, ret?:any}>;
}


//--------------------------------------------------------
// class of StateMechine
//--------------------------------------------------------
export declare class StateMechine {
  constructor();

  /**
  * @desc: 添加状态. (在状态机初始化之前有效.)
  */
  protected addState(state:State): void;

  /**
   * @desc: deal the event.
   * 在由process_event引起的操作(如State.onEnter)中调用process_event方法可能引起失败.
   * 当调用process_event之前, 将发生状态迁移的话, 则忽略process_event的执行.
   * @param currentStateIdentify: 当前的状态.
   * @param ctx: 传入一个请求上下文.
   * @return 由状态的onProcess或onEnter返回的任意对象.
   */
  process_event(currentStateIdentify:any, ctx:any, event: StateEvent): Promise<any>;
}