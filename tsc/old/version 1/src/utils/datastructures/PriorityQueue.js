"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
const BinaryHeap_1 = require("./BinaryHeap");
class PriorityQueue {
    constructor(sort) {
        this.m_Queue = new BinaryHeap_1.BinaryHeap(sort);
        this.m_ToNumber = sort;
    }
    GetEl() {
        let el = null;
        let index = -1;
        if (this.m_Queue.Size() > 0) {
            el = this.m_Queue.Get(0);
            index = 0;
        }
        return {
            el: el,
            index: index
        };
    }
    Push(el) {
        this.m_Queue.Add(el);
    }
    PushArray(el) {
        for (let e of el) {
            this.Push(e);
        }
    }
    Peek() {
        return this.GetEl().el;
    }
    Pop() {
        const el_obj = this.GetEl();
        const el = el_obj.el;
        const index = el_obj.index;
        if (index > -1) {
            this.m_Queue.Remove(index);
        }
        return el;
    }
    Clear() {
        this.m_Queue = new BinaryHeap_1.BinaryHeap(this.m_ToNumber);
    }
    Size() {
        return this.m_Queue.Size();
    }
    ToHeap() {
        return this.m_Queue;
    }
}
exports.PriorityQueue = PriorityQueue;
