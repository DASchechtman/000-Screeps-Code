export class Stack<T> {
    private m_Stack: Array<T>

    constructor() {
        this.m_Stack = new Array()
    }

    private AccessIndex(): number {
        return 0
    }

    Push(el: T): void {
        this.m_Stack.push(el)
    }

    Peek(): T | null {
        let item = null

        if (this.m_Stack.length > 0) {
            const index = this.AccessIndex()
            item = this.m_Stack[index]
        }
        return item
    }

    Pop(): T | null {
        let item = null

        if (this.m_Stack.length > 0) {
            const index = this.AccessIndex()
            item = this.m_Stack[index]
            this.m_Stack.splice(index, 1)
        }

        return item
    }

    Size(): number {
        return this.m_Stack.length
    }

    Clear(): void {
        this.m_Stack = new Array()
    }

    IsEmpty(): boolean {
        return this.m_Stack.length === 0
    }
}