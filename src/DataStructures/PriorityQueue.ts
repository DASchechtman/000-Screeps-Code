import { LinkedList } from "./LinkedList"

export class PriorityQueue<T> {
    private m_Queue: LinkedList<T>
    private m_ToNumber: (el: T) => number

    constructor(sort: (el: T) => number) {
        this.m_Queue = new LinkedList()
        this.m_ToNumber = sort
    }

    private GetEl(): { el: T | null, index: number } {
        let el: T | null | undefined = null
        let index = -1

        if (this.m_Queue.Size() > 0) {
            el = this.m_Queue.Get(0)
            index = 0
        }

        return {
            el: el,
            index: index
        }
    }

    private BinarySearch(val: T): number {
        const size = this.m_Queue.Size()
        let mid = Math.trunc(size / 2)
        let mid_adjust = mid


        while (size > 0) {
            const in_range = mid >= 1 && size >= 2

            const el = this.m_ToNumber(val)
            const cur_item = this.m_ToNumber(this.m_Queue.Get(mid)!!)

            if (in_range) {
                const prev_item = this.m_ToNumber(this.m_Queue.Get(mid - 1)!!)
                if (el >= prev_item && el <= cur_item) {
                    break
                }
            }
            else if (size < 2) {
                if (el <= cur_item) {
                    break
                }
            }

            let new_index = Math.trunc(mid_adjust / 2)

            if (new_index === 0) {
                new_index = 1
            }

            if (el > cur_item) {
                mid += new_index
            }
            else if (el < cur_item) {
                mid -= new_index
            }
            mid_adjust = new_index

            if (mid < 0 || mid >= size) {
                mid = mid < 0 ? 0 : size
                break
            }
        }

        return mid
    }

    Push(el: T): void {
        const index = this.BinarySearch(el)
        this.m_Queue.Insert(index, el)
    }

    Peek(): T | null {
        return this.GetEl().el
    }

    Pop(): T | null {
        const el_obj = this.GetEl()
        const el = el_obj.el
        const index = el_obj.index

        if (index > -1) {
            this.m_Queue.Remove(index)
        }

        return el
    }

    Clear(): void {
        this.m_Queue = new LinkedList()
    }

    Size(): number {
        return this.m_Queue.Size()
    }

    ToArray(): Array<T> {
        const cloned_array = new Array<T>()

        for (let i = 0; i < this.m_Queue.Size(); i++) {
            const el = this.m_Queue.Get(i)
            if (el) {
                cloned_array.push(el)
            }
        }

        return cloned_array
    }


}