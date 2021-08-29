export class BinaryHeap<T> {
    private m_Heap: Array<T>
    private m_ToNumber: (el: T) => number
    private m_Out_of_bouds_msg: string

    constructor(sort: (el: T) => number) {
        this.m_Heap = new Array()
        this.m_ToNumber = sort
        this.m_Out_of_bouds_msg = "Error: index out of bounds"
    }

    private GetParentNode(index: number): [T | null, number] {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        const i = Math.trunc((index - 1) / 2)
        let node: T | null = null

        if (i < this.m_Heap.length) {
            node = this.m_Heap[i]
        }

        return [node, i]
    }

    private GetLeftNode(index: number): [T | null, number] {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        const i = (2 * index) + 1
        let node: T | null = null

        if (i < this.m_Heap.length) {
            node = this.m_Heap[i]
        }

        return [node, i]
    }

    private GetRightNode(index: number): [T | null, number] {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        const i = (2 * index) + 2
        let node: T | null = null

        if (i < this.m_Heap.length) {
            node = this.m_Heap[i]
        }

        return [node, i]
    }

    private InsertItem(el: T, index: number, self: BinaryHeap<T>): boolean {
        let found_insert_index = false

        if (index >= 0 && index < self.m_Heap.length) {
            const el_num = self.m_ToNumber(el)
            const item_num = self.m_ToNumber(self.m_Heap[index])

            if (el_num <= item_num) {
                self.m_Heap.splice(index, 0, el)
                found_insert_index = true
            }
            else {
                const left_node_index = self.GetLeftNode(index)
                const right_node_index = self.GetRightNode(index)

                found_insert_index = self.InsertItem(el, left_node_index[1], self)
                if (!found_insert_index) {
                    found_insert_index = self.InsertItem(el, right_node_index[1], self)
                }

            }
        }

        return found_insert_index
    }

    private Heapify(index: number, self: BinaryHeap<T>) {

        if (index >= 0 && index < self.m_Heap.length) {
            const parent_index = self.GetParentNode(index)
            const cur = self.m_ToNumber(self.m_Heap[index])
            const parent = self.m_ToNumber(parent_index[0]!!)

            if (cur < parent) {
                self.Swap(parent_index[1], index)
                self.Heapify(parent_index[1], self)
                self.Heapify(index, self)
            }
            else {
                // left child data
                const lcd = self.GetLeftNode(index)
                // right child data
                const rcd = self.GetRightNode(index)

                // gives a way to check if a null node has been hit
                let l_node = lcd[0]
                let r_node = rcd[0]

                // check for the smallest of two child nodes
                if (l_node !== null && r_node !== null) {
                    const l_num = self.m_ToNumber(l_node)
                    const r_num = self.m_ToNumber(r_node)

                    if (l_num < cur && r_num < cur) {
                        let smallest_val: number = lcd[1]

                        if (l_num < r_num) {
                            smallest_val = lcd[1]
                        }
                        else if (r_num < l_num) {
                            smallest_val = rcd[1]
                        }

                        self.Swap(smallest_val, index)
                        self.Heapify(smallest_val, self)
                    }
                    else if (l_num < cur) {
                        self.Swap(lcd[1], index)
                        self.Heapify(lcd[1], self)
                    }
                    else if (r_num < cur) {
                        self.Swap(rcd[1], index)
                        self.Heapify(rcd[1], self)
                    }
                }
                else if (l_node !== null) {
                    const l_num = self.m_ToNumber(l_node)

                    if (l_num < cur) {
                        self.Swap(lcd[1], index)
                        self.Heapify(lcd[1], self)
                    }
                }
                else if (r_node !== null) {
                    const r_num = self.m_ToNumber(r_node)

                    if (r_num < cur) {
                        self.Swap(rcd[1], index)
                        self.Heapify(rcd[1], self)
                    }
                }
            }
        }
    }

    private Swap(item_1: number, item_2: number) {
        const tmp = this.m_Heap[item_1]
        this.m_Heap[item_1] = this.m_Heap[item_2]
        this.m_Heap[item_2] = tmp
    }

    Add(el: T): void {
        if (!this.InsertItem(el, 0, this)) {
            this.m_Heap.push(el)
        }
    }

    Remove(index: number): void {
        if (index < 0 || index >= this.m_Heap.length) {
            throw new Error(this.m_Out_of_bouds_msg)
        }
        else if (this.m_Heap.length === 0) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        const len = this.m_Heap.length
        this.Swap(len - 1, index)
        this.m_Heap.pop()
        this.Heapify(index, this)
    }

    Get(index: number): T {
        if (index < 0 || index >= this.m_Heap.length) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        return this.m_Heap[index]
    }

    Size(): number {
        return this.m_Heap.length
    }

    Has(call_back: (el: T) => boolean): boolean {
        return this.m_Heap.some(call_back)
    }

    Map<K>(call_back: (el: T) => K): Array<K> {
        return this.m_Heap.map(call_back)
    }

    Clear(): void {
        const len = this.m_Heap.length
        this.m_Heap.splice(0, len)
    }
}