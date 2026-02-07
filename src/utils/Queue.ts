export class Queue<T> {
    private queue: T[]
    constructor(arr?: T[]) {
        if (arr) {
            this.queue = arr.slice()
        }
        else {
            this.queue = []
        }
    }

    public Enqueue(...val: T[]) {
        this.queue.push(...val)
    }

    public Dequeue(): T | undefined {
        return this.queue.shift()
    }

    public Peek() {
        return this.queue.at(0)
    }

    public Size() {
        return this.queue.length
    }

    public ToArray() {
        return this.queue
    }
}
