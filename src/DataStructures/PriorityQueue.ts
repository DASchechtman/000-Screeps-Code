export class PriorityQueue<T> {
    private m_Queue: Array<T>
    private m_Sort: (a: T, b: T) => number
    private m_Was_sorted: boolean

    constructor(sort: (a: T, b: T) => number) {
        this.m_Queue = new Array()
        this.m_Sort = sort
        this.m_Was_sorted = false
    }

    private GetEl(): {el: T | null, index: number} {
        let el: T | null = null
        let index = -1

        if (!this.m_Was_sorted) {
            this.Sort()
            this.Sort()
        }

        if (this.m_Queue.length > 0) {
            el = this.m_Queue[0]
            index = 0
        }

        return {
            el: el,
            index: index
        }
    }

    Sort(): void {
        this.m_Queue = this.m_Queue.sort(this.m_Sort)
        this.m_Was_sorted = true
    }

    Push(el: T): void {
        this.m_Was_sorted = false
        this.m_Queue.push(el)
    }

    Peek(): T | null {
        return this.GetEl().el
    }

    Pop(): T | null {
        const el_obj = this.GetEl()
        const el = el_obj.el
        const index = el_obj.index

        if (index > -1) {
            this.m_Queue.shift()
        }

        return el
    }

    Clear(): void {
       this.m_Queue = new Array()
    }

    Size(): number {
        return this.m_Queue.length
    }

    ToArray(): Array<T> {
        const cloned_array = new Array<T>()

        for (let el of this.m_Queue) {
            cloned_array.push(el)
        }

        return cloned_array
    }


}