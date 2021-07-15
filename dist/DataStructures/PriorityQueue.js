"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
class PriorityQueue {
    constructor(sort) {
        this.m_Queue = new Array();
        this.m_Sort = sort;
        this.m_Was_sorted = false;
    }
    GetEl() {
        let el = null;
        let index = -1;
        if (!this.m_Was_sorted) {
            this.Sort();
            this.Sort();
        }
        if (this.m_Queue.length > 0) {
            el = this.m_Queue[0];
            index = 0;
        }
        return {
            el: el,
            index: index
        };
    }
    Sort() {
        this.m_Queue = this.m_Queue.sort(this.m_Sort);
        this.m_Was_sorted = true;
    }
    Push(el) {
        this.m_Was_sorted = false;
        this.m_Queue.push(el);
    }
    Peek() {
        return this.GetEl().el;
    }
    Pop() {
        const el_obj = this.GetEl();
        const el = el_obj.el;
        const index = el_obj.index;
        if (index > -1) {
            this.m_Queue.shift();
        }
        return el;
    }
    Clear() {
        this.m_Queue = new Array();
    }
    Size() {
        return this.m_Queue.length;
    }
    ToArray() {
        const cloned_array = new Array();
        for (let el of this.m_Queue) {
            cloned_array.push(el);
        }
        return cloned_array;
    }
}
exports.PriorityQueue = PriorityQueue;
