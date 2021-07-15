import { TIMED_STRUCTURE_TYPE } from "../Constants/GameObjectConsts";
import { StructureWrapper } from "../Structure/StructureWrapper";
import { StructuresStack } from "./StructuresStack";

export class PriorityStructuresStack {
    private m_Timed_defense_structs: StructuresStack
    private m_Timed_structs: StructuresStack
    private m_Regulare_structs: StructuresStack

    constructor() {
        this.m_Regulare_structs = new StructuresStack()
        this.m_Timed_structs = new StructuresStack()
        this.m_Timed_defense_structs = new StructuresStack()
    }

    private GetStructStack(struct: StructureWrapper<any>): StructuresStack {
        let ret = this.m_Regulare_structs

        const is_timed = struct.SignalRecieverType() === TIMED_STRUCTURE_TYPE
        const low_health = struct.GetCurHealth() < struct.GetMaxHealth() * .03
        const is_rampart = struct.GetStructure()?.structureType === STRUCTURE_RAMPART

        if (is_timed && low_health) {
            if (is_rampart) {
                ret = this.m_Timed_defense_structs
            }
            else {
                ret = this.m_Timed_structs
            }
        }

        return ret
    }

    private GetArrayOfStacks(): Array<StructuresStack> {
        return [
            this.m_Timed_defense_structs,
            this.m_Timed_structs,
            this.m_Regulare_structs
        ]
    }

    private GetTopElementInStack(): {struct: StructureWrapper<any> | null, stack: StructuresStack} {
        let ret: StructureWrapper<any> | null = null
        let stack_list = this.GetArrayOfStacks()
        let i = 0

        while (!ret && i < stack_list.length) {
            ret = stack_list[i].Peek()
            i++
        }

        return {struct: ret, stack: stack_list[i-1]}
    }

    Add(struct: StructureWrapper<any>) {
        const stack = this.GetStructStack(struct)
        stack.Add(struct)
    }

    Peek(): StructureWrapper<any> | null {
        return this.GetTopElementInStack().struct
    }

    Pop(): StructureWrapper<any> | null {
        let obj = this.GetTopElementInStack()
        obj.stack.Pop()
        return obj.struct
    }
}