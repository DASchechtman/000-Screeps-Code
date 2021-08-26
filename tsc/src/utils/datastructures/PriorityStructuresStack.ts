import { GameEntityTypes } from "../../consts/GameConstants";
import { StructureWrapper } from "../../core/StructureWrapper";
import { PriorityQueue } from "./PriorityQueue";

export class PriorityStructuresStack {
    private m_Queue: PriorityQueue<StructureWrapper<any>>

    constructor() {
        const sort_func = (el: StructureWrapper<any>): number => {
            const regular_struct = 1
            const timed_struct = .95

            const health_percent = (el.GetCurHealth()/el.GetMaxHealth())

            let sort_val = regular_struct + health_percent

            if (el.GetType() === GameEntityTypes.TIMED_STRUCTURE) {
                sort_val = timed_struct + health_percent
            }

            return sort_val
        }
        
        this.m_Queue = new PriorityQueue(sort_func)
    }

    Add(struct: StructureWrapper<any>) {
        this.m_Queue.Push(struct)
    }

    Peek(): StructureWrapper<any> | null {
        return this.m_Queue.Peek()
    }

    Pop(): StructureWrapper<any> | null {
        return this.m_Queue.Pop()
    }

    Size(): number {
        return this.m_Queue.Size()
    }

    ToArray(): Array<StructureWrapper<any>> {
        return this.m_Queue.ToArray()
    }
}