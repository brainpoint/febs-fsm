'use strict';

/**
* Copyright (c) 2019 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-09-12 16:17
* Desc: 
*/

import StateEvent from './stateEvent';

export default class StateMechine {
  private _allStates: Map<string, any/*State*/>;

  constructor() {
    this._allStates = new Map();
  }

  /**
  * @desc: 添加状态. (在状态机初始化之前有效.)
  */
  protected addState(state:any /*State*/): void {
    // lock();
    let identify = state.identify;
    if (this._allStates.has(identify )) {
      throw new Error(`state is already in: ${identify}`);
    }

    state._mechine = this;
    this._allStates.set(identify, state);
    // unlock();
  }

  /**
   * @desc: deal the event.
   * 在由process_event引起的操作(如State.onEnter)中调用process_event方法可能引起失败.
   * 当调用process_event之前, 将发生状态迁移的话, 则忽略process_event的执行.
   * @param currentStateIdentify: 当前的状态.
   * @param ctx: 传入一个请求上下文.
   * @return 由状态的onProcess或onEnter返回的任意对象.
   */
  async process_event(currentStateIdentify:any, ctx:any, event: StateEvent): Promise<any> {
    // lock();
    if (typeof currentStateIdentify !== 'string') { 
      currentStateIdentify = currentStateIdentify.name as string;
    }

    
    let curState = this._allStates.get(currentStateIdentify);
    if (curState)
    {
      let nextStateName = curState.getTransition( event.identify );
      let nextState = this._allStates.get(nextStateName);

      if (nextState) {
        curState._mechine = null;
      }

      // deal event.
      let r = await curState.onProcess(ctx, event, (nextState?nextState.identify:null));
      if (r.transition) {
        if (nextState) {
          let preState = curState;

          await curState.onLeave(ctx, event, nextState.identify);
          curState._mechine = this;
          curState = nextState;
          let r2 = await curState.onEnter(ctx, event, preState.identify);
          return (null===r2||undefined===r2)? r.ret: r2;
        }
      }
      else {
        curState._mechine = this;
        return r.ret;
      }
    }
    // unlock();
  }
}