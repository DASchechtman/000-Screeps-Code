import { TIMED_STRUCTURE_TYPE } from "../Constants/GameObjectConsts";
import { StructureWrapper } from "../Structure/StructureWrapper";
import { PriorityQueue } from "./PriorityQueue";

export class PriorityStructuresStack {
    private m_Queue: PriorityQueue<StructureWrapper<any>>

    constructor() {
        const sort_func = (el: StructureWrapper<any>): number => {
            const regular_struct = 1
            const timed_struct = .99

            const health_percent = (el.GetCurHealth()/el.GetMaxHealth()) * 100

            let sort_val = regular_struct + health_percent

            if (el.SignalRecieverType() === TIMED_STRUCTURE_TYPE) {
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

    ToArray(): Array<StructureWrapper<any>> {
        return this.m_Queue.ToArray()
    }
}