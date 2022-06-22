"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityStructuresStack = void 0;
const GameConstants_1 = require("../../consts/GameConstants");
const PriorityQueue_1 = require("./PriorityQueue");
class PriorityStructuresStack {
    constructor() {
        const sort_func = (el) => {
            const regular_struct = 1;
            const timed_struct = .95;
            const health_percent = (el.GetCurHealth() / el.GetMaxHealth());
            let sort_val = regular_struct + health_percent;
            if (el.GetType() === GameConstants_1.GameEntityTypes.DEGRADABLE_STRUCT) {
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
    Size() {
        return this.m_Queue.Size();
    }
    ToHeap() {
        return this.m_Queue.ToHeap();
    }
    Clear() {
        this.m_Queue.Clear();
    }
}
exports.PriorityStructuresStack = PriorityStructuresStack;
