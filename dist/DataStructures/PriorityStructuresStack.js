"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityStructuresStack = void 0;
const GameObjectConsts_1 = require("../Constants/GameObjectConsts");
const PriorityQueue_1 = require("./PriorityQueue");
class PriorityStructuresStack {
    constructor() {
        const sort_func = function (el) {
            const regular_struct = 1;
            const timed_struct = .99;
            const struct_health_percentage = el.GetCurHealth() / el.GetMaxHealth();
            let sort_val = regular_struct + struct_health_percentage;
            if (el.SignalRecieverType() === GameObjectConsts_1.TIMED_STRUCTURE_TYPE) {
                sort_val = timed_struct + struct_health_percentage;
            }
            return sort_val;
        };
        this.m_Queue = new PriorityQueue_1.PriorityQueue(sort_func);
    }
    GetTopElementInStack() {
        let ret = this.m_Queue.Peek();
        let i = -1;
        if (ret) {
            i = 0;
        }
        return { struct: ret, index: i };
    }
    Add(struct) {
        this.m_Queue.Push(struct);
    }
    Peek() {
        return this.GetTopElementInStack().struct;
    }
    Pop() {
        let obj = this.GetTopElementInStack();
        if (obj.index > -1) {
            this.m_Queue.Pop();
        }
        return obj.struct;
    }
}
exports.PriorityStructuresStack = PriorityStructuresStack;
