'use strict';

/**
* Copyright (c) 2019 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-09-12 15:24
* Desc: 
*/

/**
* @desc: 状态事件, 可以使用这个类传递参数. 
*/
export default abstract class StateEvent {

  private _identify:string;

  constructor(identify:string) {
    this._identify = identify;
  }

  /**
  * @desc: 获得在状态机中的标识.
  */
  get identify():string { return this._identify; }
}