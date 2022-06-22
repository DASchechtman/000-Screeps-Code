import { BinaryHeap } from "./BinaryHeap"
import { LinkedList } from "./LinkedList"

export class PriorityQueue<T> {
    private m_Queue: BinaryHeap<T>
    private m_ToNumber: (el: T) => number

    constructor(sort: (el: T) => number) {
        this.m_Queue = new BinaryHeap(sort)
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

    Push(el: T): void {
        this.m_Queue.Add(el)
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
        this.m_Queue = new BinaryHeap(this.m_ToNumber)
    }

    Size(): number {
        return this.m_Queue.Size()
    }

    ToHeap(): BinaryHeap<T> {
        return this.m_Queue
    }
}