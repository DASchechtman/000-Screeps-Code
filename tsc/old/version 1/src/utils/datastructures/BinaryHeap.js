"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryHeap = void 0;
class BinaryHeap {
    constructor(sort) {
        this.m_Heap = [];
        this.m_ToNumber = sort;
        this.m_Out_of_bouds_msg = "Error: index out of bounds";
    }
    GetParentNode(index) {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg);
        }
        const i = Math.trunc((index - 1) / 2);
        let node = null;
        if (i < this.m_Heap.length) {
            node = this.m_Heap[i];
        }
        return [node, i];
    }
    GetLeftNode(index) {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg);
        }
        const i = (2 * index) + 1;
        let node = null;
        if (i < this.m_Heap.length) {
            node = this.m_Heap[i];
        }
        return [node, i];
    }
    GetRightNode(index) {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg);
        }
        const i = (2 * index) + 2;
        let node = null;
        if (i < this.m_Heap.length) {
            node = this.m_Heap[i];
        }
        return [node, i];
    }
    InsertItem(el, index, self) {
        let found_insert_index = false;
        if (index >= 0 && index < self.m_Heap.length) {
            const el_num = self.m_ToNumber(el);
            const item_num = self.m_ToNumber(self.m_Heap[index]);
            if (el_num <= item_num) {
                self.m_Heap.splice(index, 0, el);
                found_insert_index = true;
            }
            else {
                const left_node_index = self.GetLeftNode(index);
                const right_node_index = self.GetRightNode(index);
                found_insert_index = self.InsertItem(el, left_node_index[1], self);
                if (!found_insert_index) {
                    found_insert_index = self.InsertItem(el, right_node_index[1], self);
                }
            }
        }
        return found_insert_index;
    }
    Heapify(index, self) {
        if (index >= 0 && index < self.m_Heap.length) {
            const parent_index = self.GetParentNode(index);
            const cur = self.m_ToNumber(self.m_Heap[index]);
            const parent = self.m_ToNumber(parent_index[0]);
            if (cur < parent) {
                self.Swap(parent_index[1], index);
                self.Heapify(parent_index[1], self);
                self.Heapify(index, self);
            }
            else {
                // left child data
                const lcd = self.GetLeftNode(index);
                // right child data
                const rcd = self.GetRightNode(index);
                // gives a way to check if a null node has been hit
                let l_node = lcd[0];
                let r_node = rcd[0];
                // check for the smallest of two child nodes
                if (l_node !== null && r_node !== null) {
                    const l_num = self.m_ToNumber(l_node);
                    const r_num = self.m_ToNumber(r_node);
                    if (l_num < cur && r_num < cur) {
                        let smallest_val = lcd[1];
                        if (l_num < r_num) {
                            smallest_val = lcd[1];
                        }
                        else if (r_num < l_num) {
                            smallest_val = rcd[1];
                        }
                        self.Swap(smallest_val, index);
                        self.Heapify(smallest_val, self);
                    }
                    else if (l_num < cur) {
                        self.Swap(lcd[1], index);
                        self.Heapify(lcd[1], self);
                    }
                    else if (r_num < cur) {
                        self.Swap(rcd[1], index);
                        self.Heapify(rcd[1], self);
                    }
                }
                else if (l_node !== null) {
                    const l_num = self.m_ToNumber(l_node);
                    if (l_num < cur) {
                        self.Swap(lcd[1], index);
                        self.Heapify(lcd[1], self);
                    }
                }
                else if (r_node !== null) {
                    const r_num = self.m_ToNumber(r_node);
                    if (r_num < cur) {
                        self.Swap(rcd[1], index);
                        self.Heapify(rcd[1], self);
                    }
                }
            }
        }
    }
    Swap(item_1, item_2) {
        const tmp = this.m_Heap[item_1];
        this.m_Heap[item_1] = this.m_Heap[item_2];
        this.m_Heap[item_2] = tmp;
    }
    Add(el) {
        if (!this.InsertItem(el, 0, this)) {
            this.m_Heap.push(el);
        }
    }
    Remove(index) {
        if (index < 0 || index >= this.m_Heap.length) {
            throw new Error(this.m_Out_of_bouds_msg);
        }
        else if (this.m_Heap.length === 0) {
            throw new Error(this.m_Out_of_bouds_msg);
        }
        const len = this.m_Heap.length;
        this.Swap(len - 1, index);
        this.m_Heap.pop();
        this.Heapify(index, this);
    }
    Get(index) {
        if (index < 0 || index >= this.m_Heap.length) {
            throw new Error(this.m_Out_of_bouds_msg);
        }
        return this.m_Heap[index];
    }
    Size() {
        return this.m_Heap.length;
    }
    Has(call_back) {
        return this.m_Heap.some(call_back);
    }
    Map(call_back) {
        return this.m_Heap.map(call_back);
    }
    Clear() {
        const len = this.m_Heap.length;
        this.m_Heap.splice(0, len);
    }
}
exports.BinaryHeap = BinaryHeap;
