import { LinkedList } from "./LinkedList";

export class QuickLinkedList<T> {
    private m_List: LinkedList<LinkedList<T>>
    private m_Page_size: number
    private m_Size: number

    constructor() {
        this.m_List = new LinkedList()
        this.m_Page_size = 50
        this.m_Size = 0
    }

    private GetIndexes(index: number) {
        const list_index = Math.trunc(index/this.m_Page_size)
        const item_index = index - (this.m_Page_size * list_index)
        return {
            list_i: list_index,
            item_i: item_index
        }
    }

    private CheckInRange(index: number, exclude_end: boolean=false) {
        let throw_error = index < 0 || index >= this.m_Size

        if (exclude_end) {
            throw_error = index < 0 || index > this.m_Size
        }

        if (throw_error) {
            throw new Error("QuickLinkedList: out of bounds exception")
        }
    }

    Add(el: T): void {
        const indexes = this.GetIndexes(this.m_Size)
        if (this.m_List.Size() === indexes.list_i) {
            this.m_List.Add(new LinkedList())
        }

        this.m_List.Get(indexes.list_i)!!.Add(el)
        this.m_Size++
    }

    Get(index: number): T | null {
        this.CheckInRange(index)
        const indexes = this.GetIndexes(index)
        return this.m_List.Get(indexes.list_i)!!.Get(indexes.item_i)
    }

    Insert(index: number, el: T) {
        this.CheckInRange(index, true)
        const indexes = this.GetIndexes(index)

        this.m_List.Get(indexes.list_i)!!.Insert(indexes.item_i, el)

        if (this.m_List.Get(indexes.list_i)!!.Size() > this.m_Page_size) {
            let page = this.m_List.Get(indexes.list_i)

            while(page && page.Size() > this.m_Page_size) {
                
            }
        }
    }
}