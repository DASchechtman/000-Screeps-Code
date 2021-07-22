"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedList = void 0;
class LinkedList {
    constructor() {
        this.size = 0;
    }
    MoveTo(index) {
        while (this.cur && index !== this.cur.index) {
            if (index > this.cur.index) {
                this.cur = this.cur.next;
            }
            else if (index < this.cur.index) {
                this.cur = this.cur.prev;
            }
        }
    }
    Reindex() {
        let node_copy = this.head;
        let index = 0;
        while (node_copy) {
            node_copy.index = index;
            index++;
            node_copy = node_copy.next;
        }
    }
    CheckInRange(index, include_end = true) {
        let throw_error = index < 0 || index >= this.size;
        if (!include_end) {
            throw_error = index < 0 || index > this.size;
        }
        if (throw_error) {
            throw new Error("Out Of Bounds Error: Linked List");
        }
    }
    Add(el) {
        if (!this.head) {
            this.head = { index: 0 };
        }
        if (!this.cur) {
            this.cur = this.head;
        }
        if (!this.end) {
            this.end = this.head;
        }
        if (!this.head.val) {
            this.head.val = el;
        }
        else {
            const new_node = {
                index: this.end.index + 1,
                val: el,
            };
            this.end.next = new_node;
            new_node.prev = this.end;
            this.end = new_node;
        }
        this.size++;
    }
    Get(index) {
        let ret;
        try {
            this.CheckInRange(index);
            if (index === 0) {
                this.cur = this.head;
            }
            else if (index === this.size - 1) {
                this.cur = this.end;
            }
            else {
                this.MoveTo(index);
            }
            ret = this.cur.val;
        }
        catch (_a) {
            ret = null;
        }
        return ret;
    }
    Remove(index) {
        var _a, _b, _c, _d;
        try {
            this.CheckInRange(index);
            if (index === 0) {
                const tmp_head = this.head;
                if ((_a = this.head) === null || _a === void 0 ? void 0 : _a.next) {
                    this.head = (_b = this.head) === null || _b === void 0 ? void 0 : _b.next;
                    this.head.prev = undefined;
                    if (tmp_head === this.cur) {
                        this.cur = this.head;
                    }
                    this.Reindex();
                }
                else {
                    this.head = undefined;
                    this.cur = this.head;
                    this.end = this.head;
                }
            }
            else if (index === this.size - 1) {
                const tmp_end = this.end;
                if ((_c = this.end) === null || _c === void 0 ? void 0 : _c.prev) {
                    this.end = (_d = this.end) === null || _d === void 0 ? void 0 : _d.prev;
                    this.end.next = undefined;
                    if (tmp_end === this.cur) {
                        this.cur = this.end;
                    }
                }
                else {
                    this.head = undefined;
                    this.cur = this.head;
                    this.end = this.head;
                }
            }
            else if (this.cur) {
                this.MoveTo(index);
                const prev = this.cur.prev;
                const next = this.cur.next;
                if (prev) {
                    prev.next = next;
                }
                if (next) {
                    next.prev = prev;
                }
                this.cur = prev;
                this.Reindex();
            }
            this.size--;
        }
        catch (_e) {
            console.log("Error: could not remove element");
        }
    }
    Insert(index, el) {
        try {
            this.CheckInRange(index, false);
            if (index === this.size) {
                this.Add(el);
                this.size--;
            }
            else if (index === 0) {
                const new_head = {
                    index: 0,
                    val: el,
                    next: this.head
                };
                if (this.head) {
                    this.head.prev = new_head;
                }
                this.head = new_head;
                this.Reindex();
            }
            else if (index === this.size - 1) {
                if (this.end) {
                    const new_node = {
                        index: this.end.index,
                        val: el,
                    };
                    const prev = this.end.prev;
                    if (prev) {
                        prev.next = new_node;
                        new_node.prev = prev;
                    }
                    new_node.next = this.end;
                    this.end.prev = new_node;
                    this.end.index++;
                }
            }
            else {
                this.MoveTo(index);
                if (this.cur) {
                    const new_node = {
                        index: 0,
                        val: el
                    };
                    const prev = this.cur.prev;
                    if (prev) {
                        prev.next = new_node;
                        new_node.prev = prev;
                    }
                    new_node.next = this.cur;
                    this.cur.prev = new_node;
                }
                this.Reindex();
            }
            this.size++;
        }
        catch (_a) {
            console.log("Error: could not insert");
        }
    }
    Size() {
        return this.size;
    }
}
exports.LinkedList = LinkedList;
