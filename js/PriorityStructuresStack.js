"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityStructuresStack = void 0;
const GameObjectConsts_1 = require("./GameObjectConsts");
const PriorityQueue_1 = require("./PriorityQueue");
class PriorityStructuresStack {
    constructor() {
        const sort_func = (el) => {
            const regular_struct = 1;
            const timed_struct = .99;
            const health_percent = (el.GetCurHealth() / el.GetMaxHealth()) * 100;
            let sort_val = regular_struct + health_percent;
            if (el.SignalRecieverType() === GameObjectConsts_1.TIMED_STRUCTURE_TYPE) {
                sort_val = timed_struct + health_percent;
            }
            return sort_val;
        };
        this.m_Queue = new PriorityQueue_1.PriorityQueue(sort_func);
    }
    Add(struct) {
        this.m_Queue.Push(struct);
    }
    Peek() {
        return this.m_Queue.Peek();
    }
    Pop() {
        return this.m_Queue.Pop();
    }
    ToArray() {
        return this.m_Queue.ToArray();
    }
}
exports.PriorityStructuresStack = PriorityStructuresStack;
