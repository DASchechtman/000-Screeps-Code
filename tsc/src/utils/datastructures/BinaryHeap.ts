export class BinaryHeap<T> {
    private m_Heap: Array<T>
    private m_ToNumber: (el: T) => number
    private m_Out_of_bouds_msg: string

    constructor(sort: (el: T) => number) {
        this.m_Heap = new Array()
        this.m_ToNumber = sort
        this.m_Out_of_bouds_msg = "Error: index out of bounds"
    }

    private GetParentNode(index: number): number {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        return Math.trunc((index - 1) / 2)
    }

    private GetLeftNode(index: number): number {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        return (2 * index) + 1
    }

    private GetRightNode(index: number): number {
        if (index < 0) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        return (2 * index) + 2
    }

    private InsertItem(el: T, index: number, heap: BinaryHeap<T>): boolean {
        let found_insert_index = false
        try {
            const el_num = heap.m_ToNumber(el)
            const item_num = heap.m_ToNumber(heap.m_Heap[index])

            if (el_num <= item_num) {
                heap.m_Heap.splice(index, 0, el)
                found_insert_index = true
            }
            else {
                const left_node_index = heap.GetLeftNode(index)
                const right_node_index = heap.GetRightNode(index)

                found_insert_index = heap.InsertItem(el, left_node_index, heap)
                if (!found_insert_index) {
                    found_insert_index = heap.InsertItem(el, right_node_index, heap)
                }

            }
        } catch (e) {
            heap.m_Heap.push(el)
            found_insert_index = true
        }

        return found_insert_index
    }

    Add(el: T): void {
        debugger
        if (this.m_Heap.length === 0) {
            this.m_Heap.push(el)
        }
        else {
            this.InsertItem(el, 0, this)
        }
    }

    Remove(index: number): void {
        if (index < 0 || index >= this.m_Heap.length) {
            throw new Error(this.m_Out_of_bouds_msg)
        }

        this.m_Heap.splice(index, 1)
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
}