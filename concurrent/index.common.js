'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
* @desc: 简单状态.
*/
class State {
    constructor(identify) {
        this._identify = identify;
        this._transitions = new Map();
    }
    /**
    * @desc: 获得在状态机中的标识.
    */
    get identify() { return this._identify; }
    /**
    * @desc: 获得所在的状态机. 如果当前不能进行状态转移此值会为null, 当可以进行状态转移时会变为非空.
    */
    get mechine() { return this._mechine; }
    /**
    * @desc: 添加状态转换 (状态机启动后, 不允许添加).
    */
    addTransition(event, state) {
        let eventIdentify = event.identify;
        let stateIdentify = state.identify;
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
    getTransition(event) {
        if (typeof event === 'string') {
            var eventIdentify = event;
        }
        else {
            var eventIdentify = event.name;
        }
        return this._transitions.get(eventIdentify);
    }
}

/**
* Copyright (c) 2019 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-09-12 15:24
* Desc:
*/
/**
* @desc: 状态事件, 可以使用这个类传递参数.
*/
class StateEvent {
    constructor(identify) {
        this._identify = identify;
    }
    /**
    * @desc: 获得在状态机中的标识.
    */
    get identify() { return this._identify; }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class StateMechine {
    constructor() {
        this._allStates = new Map();
    }
    /**
    * @desc: 添加状态. (在状态机初始化之前有效.)
    */
    addState(state /*State*/) {
        // lock();
        let identify = state.identify;
        if (this._allStates.has(identify)) {
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
    process_event(currentStateIdentify, ctx, event) {
        return __awaiter(this, void 0, void 0, function* () {
            // lock();
            if (typeof currentStateIdentify !== 'string') {
                currentStateIdentify = currentStateIdentify.name;
            }
            let curState = this._allStates.get(currentStateIdentify);
            if (curState) {
                let nextStateName = curState.getTransition(event.identify);
                let nextState = this._allStates.get(nextStateName);
                if (nextState) {
                    curState._mechine = null;
                }
                // deal event.
                let r = yield curState.onProcess(ctx, event, (nextState ? nextState.identify : null));
                if (r.transition) {
                    if (nextState) {
                        let preState = curState;
                        yield curState.onLeave(ctx, event, nextState.identify);
                        curState._mechine = this;
                        curState = nextState;
                        let r2 = yield curState.onEnter(ctx, event, preState.identify);
                        return (null === r2 || undefined === r2) ? r.ret : r2;
                    }
                }
                else {
                    curState._mechine = this;
                    return r.ret;
                }
            }
            // unlock();
        });
    }
}

exports.State = State;
exports.StateEvent = StateEvent;
exports.StateMechine = StateMechine;
//# sourceMappingURL=index.common.js.map
