import { TIMED_STRUCTURE_TYPE } from "../Constants/GameObjectConsts";
import { StructureWrapper } from "../Structure/StructureWrapper";
import { PriorityQueue } from "./PriorityQueue";
import { StructuresStack } from "./StructuresStack";

export class PriorityStructuresStack {
    private m_Queue: PriorityQueue<StructureWrapper<any>>

    constructor() {
        const sort_func = function (el: StructureWrapper<any>): number {
            const regular_struct = 1
            const timed_struct = .99

            const struct_health_percentage = el.GetCurHealth() / el.GetMaxHealth()
            
            let sort_val = regular_struct + struct_health_percentage

            if (el.SignalRecieverType() === TIMED_STRUCTURE_TYPE) {
                sort_val = timed_struct + struct_health_percentage
            }

            return sort_val
        }
        
        this.m_Queue = new PriorityQueue(sort_func)
    }


    private GetTopElementInStack(): {struct: StructureWrapper<any> | null, index: number} {
        let ret = this.m_Queue.Peek()
        let i = -1

        if(ret) {
            i = 0
        }

        return {struct: ret, index: i}
    }

    Add(struct: StructureWrapper<any>) {
        this.m_Queue.Push(struct)
    }

    Peek(): StructureWrapper<any> | null {
        return this.GetTopElementInStack().struct
    }

    Pop(): StructureWrapper<any> | null {
        let obj = this.GetTopElementInStack()
        if (obj.index > -1) {
            this.m_Queue.Pop()
        }
        return obj.struct
    }
}