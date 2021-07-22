import { LinkedListNode } from "../CompilerTyping/Interfaces";

export class LinkedList<T> {
    private head: LinkedListNode<T> | undefined
    private end: LinkedListNode<T> | undefined
    private cur: LinkedListNode<T> | undefined

    private size: number

    constructor() {
        this.size = 0
    }

    private MoveTo(index: number): void {
        while (this.cur && index !== this.cur.index) {
            if (index > this.cur.index) {
                this.cur = this.cur.next
            }
            else if (index < this.cur.index) {
                this.cur = this.cur.prev
            }
        }
    }

    private Reindex(): void {
        let node_copy = this.head
        let index = 0

        while (node_copy) {
            node_copy.index = index
            index++
            node_copy = node_copy.next
        }
    }

    private CheckInRange(index: number, include_end:boolean = true): void {
        let throw_error = index < 0 || index >= this.size
        if (!include_end) {
            throw_error = index < 0 || index > this.size
        }

        if (throw_error) {
            throw new Error("Out Of Bounds Error: Linked List")
        }
    }

    Add(el: T): void {
        if (!this.head) {
            this.head = { index: 0 }
        }
        if (!this.cur) {
            this.cur = this.head
        }
        if (!this.end) {
            this.end = this.head
        }

        if (!this.head.val) {
            this.head.val = el
        }
        else {
            const new_node: LinkedListNode<T> = {
                index: this.end.index + 1,
                val: el,
            }

            this.end.next = new_node
            new_node.prev = this.end
            this.end = new_node
        }
        this.size++
    }

    Get(index: number): T | null {
        let ret: T | null
        try {
            this.CheckInRange(index)

            if (index === 0) {
                this.cur = this.head
            }
            else if (index === this.size - 1) {
                this.cur = this.end
            }
            else {
                this.MoveTo(index)
            }

            ret = this.cur!!.val!!
        }
        catch {
            ret = null
        }
        return ret
    }

    Remove(index: number): void {
        try {
            this.CheckInRange(index)
            if (index === 0) {
                const tmp_head = this.head

                if (this.head?.next) {
                    this.head = this.head?.next
                    this.head.prev = undefined

                    if (tmp_head === this.cur) {
                        this.cur = this.head
                    }

                    this.Reindex()
                }
                else {
                    this.head = undefined
                    this.cur = this.head
                    this.end = this.head
                }
            }
            else if (index === this.size - 1) {
                const tmp_end = this.end

                if (this.end?.prev) {
                    this.end = this.end?.prev
                    this.end.next = undefined
                    if (tmp_end === this.cur) {
                        this.cur = this.end
                    }
                }
                else {
                    this.head = undefined
                    this.cur = this.head
                    this.end = this.head
                }
            }
            else if (this.cur) {
                this.MoveTo(index)

                const prev = this.cur.prev
                const next = this.cur.next

                if (prev) {
                    prev.next = next
                }

                if (next) {
                    next.prev = prev
                }

                this.cur = prev
                this.Reindex()
            }
            this.size--
        }
        catch {
            console.log("Error: could not remove element")
        }
    }

    Insert(index: number, el: T) {
        try {
            this.CheckInRange(index, false)
            if (index === this.size) {
                this.Add(el)
                this.size--
            }
            else if (index === 0) {
                const new_head: LinkedListNode<T> = {
                    index: 0,
                    val: el,
                    next: this.head
                }

                if (this.head) {
                    this.head.prev = new_head
                }

                this.head = new_head


                this.Reindex()
            }
            else if (index === this.size - 1) {
                if (this.end) {
                    const new_node: LinkedListNode<T> = {
                        index: this.end.index,
                        val: el,
                    }

                    const prev = this.end.prev

                    if(prev) {
                        prev.next = new_node
                        new_node.prev = prev
                    }

                    new_node.next = this.end
                    this.end.prev = new_node
                    this.end.index++
                }
            }
            else {

                this.MoveTo(index)

                if (this.cur) {
                    const new_node: LinkedListNode<T> = {
                        index: 0,
                        val: el
                    }

                    const prev = this.cur.prev

                    if (prev) {
                        prev.next = new_node
                        new_node.prev = prev
                    }

                    new_node.next = this.cur
                    this.cur.prev = new_node
                }


                this.Reindex()
            }

            this.size++
        } catch {
            console.log("Error: could not insert")
        }
    }

    Size(): number {
        return this.size
    }
}