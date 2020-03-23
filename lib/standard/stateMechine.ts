'use strict';

/**
* Copyright (c) 2019 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-09-12 16:17
* Desc: 
*/

// import State from './state';
import StateEvent from './stateEvent';

export default class StateMechine {
  private _allStates: Map<string, any/*State*/>;
  private _curState: any/*State*/;
  private _willTransition: boolean;
  private _initEventIdentify:string;

  constructor(initStateIdentify: string) {
    this._allStates = new Map();
    this._curState = null;
    this._willTransition = true;
    this._initEventIdentify = initStateIdentify;
  }

  /**
  * @desc: 是否中断.
  */
  get isTerminated() { return this._curState == null; }

  /**
  * @desc: 中断.
  */
  async terminate(): Promise<void> {
    // lock();
    if (!this.isTerminated) {
      this._curState = null;
    }
    // unlock();
  }

  /**
  * @desc: 添加状态. (在状态机初始化之前有效.)
  */
  protected addState(state: any/*State*/): void {
    // lock();
    let identify = state.identify;
    if (this.isTerminated) {
      if (this._allStates.has(identify)) {
        throw new Error(`state is already in: ${identify}`);
      }

      state._mechine = this;
      this._allStates.set(identify, state);
    }
    else {
      throw new Error(`state mechine is already in running: ${identify}`);
    }
    // unlock();
  }

  /**
  * @desc: 指定一个初始状态, 并初始化mechine.
  */
  async initiate(): Promise<void> {
    // lock();
    if (this.isTerminated) {
      let initState = this._allStates.get(this._initEventIdentify);
      if (!initState) {
        throw new Error(`cannot find initState: ${this._initEventIdentify}`);
      }

      this._curState = initState;
      await this._curState.onEnter(null, null);
    }
    // unlock();
  }

  /**
   * @desc: deal the event.
   * 在由process_event引起的操作(如State.onEnter)中调用process_event方法可能引起失败.
   * 当调用process_event之前, 将发生状态迁移的话, 则忽略process_event的执行.
   * @return 由状态的onProcess或onEnter返回的任意对象.
   */
  async process_event(event: StateEvent): Promise<any> {
    // lock();
    if (!this._willTransition && this._curState) // 无跳转才能执行.
    {
      let nextStateName = this._curState.getTransition(event.identify);
      let nextState = this._allStates.get(nextStateName);

      if (nextState) {
        this._willTransition = true;
        this._curState._mechine = null;
      }

      // deal event.
      let r = await this._curState.onProcess(event, nextState);
      if (r.transition) {
        if (nextState) {
          let preState = this._curState;
          await this._curState.onLeave(event, nextState);
          this._curState._mechine = this;
          this._curState = nextState;
          this._willTransition = false;
          let r2 = await this._curState.onEnter(event, preState);
          return (null===r2||undefined===r2)? r.ret: r2;
        }
      }
      else {
        this._curState._mechine = this;
        return r.ret;
      }
    }
    // unlock();
  }
}