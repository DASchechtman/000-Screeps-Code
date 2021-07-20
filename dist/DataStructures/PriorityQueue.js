"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
const LinkedList_1 = require("./LinkedList");
class PriorityQueue {
    constructor(sort) {
        this.m_Queue = new LinkedList_1.LinkedList();
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
    BinarySearch(val) {
        const size = this.m_Queue.Size();
        let mid = Math.trunc(size / 2);
        let mid_adjust = mid;
        while (size > 0) {
            const in_range = mid >= 1 && size >= 2;
            const el = this.m_ToNumber(val);
            const cur_item = this.m_ToNumber(this.m_Queue.Get(mid));
            if (in_range) {
                const prev_item = this.m_ToNumber(this.m_Queue.Get(mid - 1));
                if (el >= prev_item && el <= cur_item) {
                    break;
                }
            }
            else if (size < 2) {
                if (el <= cur_item) {
                    break;
                }
            }
            let new_index = Math.trunc(mid_adjust / 2);
            if (new_index === 0) {
                new_index = 1;
            }
            if (el > cur_item) {
                mid += new_index;
            }
            else if (el < cur_item) {
                mid -= new_index;
            }
            mid_adjust = new_index;
            if (mid < 0 || mid >= size) {
                mid = mid < 0 ? 0 : size;
                break;
            }
        }
        return mid;
    }
    Push(el) {
        const index = this.BinarySearch(el);
        this.m_Queue.Insert(index, el);
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
        this.m_Queue = new LinkedList_1.LinkedList();
    }
    Size() {
        return this.m_Queue.Size();
    }
    ToArray() {
        const cloned_array = new Array();
        for (let i = 0; i < this.m_Queue.Size(); i++) {
            const el = this.m_Queue.Get(i);
            if (el) {
                cloned_array.push(el);
            }
        }
        return cloned_array;
    }
}
exports.PriorityQueue = PriorityQueue;
