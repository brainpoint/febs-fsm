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
    getTransition(eventIdentify) {
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
    constructor(initStateIdentify) {
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
    terminate() {
        return __awaiter(this, void 0, void 0, function* () {
            // lock();
            if (!this.isTerminated) {
                this._curState = null;
            }
            // unlock();
        });
    }
    /**
    * @desc: 添加状态. (在状态机初始化之前有效.)
    */
    addState(state /*State*/) {
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
    initiate() {
        return __awaiter(this, void 0, void 0, function* () {
            // lock();
            if (this.isTerminated) {
                let initState = this._allStates.get(this._initEventIdentify);
                if (!initState) {
                    throw new Error(`cannot find initState: ${this._initEventIdentify}`);
                }
                this._curState = initState;
                yield this._curState.onEnter(null, null);
            }
            // unlock();
        });
    }
    /**
     * @desc: deal the event.
     * 在由process_event引起的操作(如State.onEnter)中调用process_event方法可能引起失败.
     * 当调用process_event之前, 将发生状态迁移的话, 则忽略process_event的执行.
     * @return 由状态的onProcess或onEnter返回的任意对象.
     */
    process_event(event) {
        return __awaiter(this, void 0, void 0, function* () {
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
                let r = yield this._curState.onProcess(event, nextState);
                if (r.transition) {
                    if (nextState) {
                        let preState = this._curState;
                        yield this._curState.onLeave(event, nextState);
                        this._curState._mechine = this;
                        this._curState = nextState;
                        this._willTransition = false;
                        let r2 = yield this._curState.onEnter(event, preState);
                        return (null === r2 || undefined === r2) ? r.ret : r2;
                    }
                }
                else {
                    this._curState._mechine = this;
                    return r.ret;
                }
            }
            // unlock();
        });
    }
}

export { State, StateEvent, StateMechine };
//# sourceMappingURL=index.esm.js.map
