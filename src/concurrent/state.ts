'use strict';

/**
* Copyright (c) 2019 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-09-12 15:21
* Desc: 
*/

import StateEvent from './stateEvent';
import StateMechine from './stateMechine';

/**
* @desc: 简单状态.
*/
export default abstract class State {

  private _identify:string;
  private _transitions: Map<string, string>;
  private _mechine: StateMechine;

  constructor(identify:string) {
    this._identify = identify;
    this._transitions = new Map();
  }

  /**
  * @desc: 获得在状态机中的标识.
  */
  get identify():string { return this._identify; }

  /**
  * @desc: 获得所在的状态机. 如果当前不能进行状态转移此值会为null, 当可以进行状态转移时会变为非空.
  */
  get mechine() { return this._mechine; }

  /**
  * @desc: 添加状态转换 (状态机启动后, 不允许添加).
  */
  addTransition(event:StateEvent, state:State) {
    let eventIdentify = event.identify;
    let stateIdentify = state.identify;


    if (typeof eventIdentify !== 'string' || eventIdentify.length == 0 ||
      typeof stateIdentify !== 'string' || stateIdentify.length == 0) {
      throw new Error('identify is empty');
    }

    if (this._mechine) {
      throw new Error(`the state mechine is running: ${eventIdentify}`);
    }
    if (this._transitions.has(eventIdentify)) {
      throw new Error(`the state event is existed: ${eventIdentify}`);
    }

    this._transitions.set(eventIdentify, stateIdentify);
  }

  /**
  * @desc: 查询指定事件对应要转换到的状态 identify.
  */
  getTransition(event:any):string {
    if (typeof event === 'string') { 
      var eventIdentify = event;
    }
    else {
      var eventIdentify = event.identify as string;
    }

    if (typeof eventIdentify !== 'string' || eventIdentify.length == 0) {
      throw new Error('event identify is empty');
    }
    
    return this._transitions.get(eventIdentify);
  }

  /**
   * @desc: enter the state. 状态机已经完成了状态切换, 可以继续调用StateMechine.process_event触发状态切换.
   */
  abstract async onEnter( ctx:any, event:StateEvent, preStateIdentify:string ):Promise<any>;

  /**
   * @desc: leave the state. 即将进入下一状态, 故无法调用StateMechine.process_event触发状态切换.
   */
  abstract async onLeave( ctx:any, event:StateEvent, nextStateIdentify:string ):Promise<void>;

  /**
   * @desc: 当前状态处理事件. 每个事件在处理时, 都会交由当前状态处理.
   * @param nextState 表明当前状态处理完event后要转移的下一个状态;
   *                  如果此值不为null,则存在状态转转移, 故无法调用StateMechine.process_event触发状态切换.
   * @return transition表明是否可以进行状态转移; ret是允许返回给用户的任意值.
   */
  abstract async onProcess( ctx:any, event:StateEvent, nextStateIdentify:string ):Promise<{transition:boolean, ret?:any}>;
}