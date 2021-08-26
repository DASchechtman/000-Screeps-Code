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

    private FindInsertIndex(val: T): number {
        const size = this.m_Queue.Size()
        let mid = Math.trunc(size / 2)
        let mid_adjust = mid

        const InLoopRange = function(index: number, size: number) { return mid >= 0 && mid < size }

        while (InLoopRange(mid, size)) {
            const el = this.m_ToNumber(val)
            const cur_item = this.m_ToNumber(this.m_Queue.Get(mid)!!)

            let found_index = (function(ToNum: (el: T) => number, queue: LinkedList<T>, el: number, cur_item: number) {
                let should_break = false
                const check_for_spot = mid >= 1 && size >= 2
                const prev_element = queue.Get(mid - 1)

                if (check_for_spot && prev_element) {
                    const prev_item = ToNum(prev_element)
                    if (el >= prev_item && el <= cur_item) {
                        should_break = true
                    }
                }
                else if (size < 2) {
                    if (el <= cur_item) {
                        should_break = true
                    }
                }

                return should_break
            })(this.m_ToNumber, this.m_Queue, el, cur_item)

            // in the event an index isn't found, checks to see if a new
            // index should be evaluated. Also checks to see if the value of el
            // equals the value of the current index
            let found_equal_val = found_index ? found_index : (function(el: number, cur_item: number) {
                let should_break = false
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
                else {
                    should_break = true
                }

                mid_adjust = new_index

                return should_break
            })(el, cur_item)

            if (found_equal_val) {
                break
            }
        }

        if (mid < 0) {
            mid = 0
        }
        else if (mid >= size) {
            mid = size
        }

        return mid
    }

    Push(el: T): void {
        const index = this.FindInsertIndex(el)
        this.m_Queue.Insert(index, el)
    }

    PushArray(el: T[]) {
        for (let e of el) {
            this.Push(e)
        }
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