export class MinHeap<T> {
    private heap: T[]
    private WeightFn: (a: T) => number | string

    constructor(heap: T[], WeightFn?: (a: T) => number) {
        this.heap = heap
        this.WeightFn = WeightFn ? WeightFn : (a: T) => typeof a === 'number' ? a : String(a)
        let n = this.heap.length
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            this.Heapify(this.heap, n, i)
        }
    }

    private Heapify(arr: T[], arr_length: number, i: number) {
        let smallest = i
        let left = 2 * i + 1
        let right = 2 * i + 2

        if (left < arr_length && this.WeightFn(arr[left]) < this.WeightFn(arr[smallest])) {
            smallest = left
        }
        if (right < arr_length && this.WeightFn(arr[right]) < this.WeightFn(arr[smallest])) {
            smallest = right
        }

        if (smallest !== i) {
            [arr[i], arr[smallest]] = [arr[smallest], arr[i]]
            this.Heapify(arr, arr_length, smallest)
        }

    }

    public Peek() {
        return this.heap[0]
    }

    public Insert(val: T) {
        this.heap.push(val)
        let index = this.heap.length - 1
        const MidPointIndex = (i: number) => Math.floor((i - 1) / 2)
        while (index > 0 && this.heap[MidPointIndex(index)] > this.heap[index]) {
            [this.heap[index], this.heap[MidPointIndex(index)]] = [this.heap[MidPointIndex(index)], this.heap[index]]
            index = MidPointIndex(index)
        }
    }

    public Delete(val: T) {
        let index = this.heap.indexOf(val)
        if (index < 0) {
            return
        }

        if(this.heap.length === 1) {
            this.heap = []
            return
        }

        this.heap[index] = this.heap.pop()!
        this.Heapify(this.heap, this.heap.length, index)
    }
}
