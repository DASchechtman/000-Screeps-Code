import { TIMED_STRUCTURE_TYPE } from "../Constants/GameObjectConsts"
import { StructureWrapper } from "../Structure/StructureWrapper"

type StructuresArray = Array<Array<StructureWrapper<any>>>

export class StructuresStack {
    private readonly HIGH_PRIORITY: number
    private readonly MED_PRIORITY: number
    private readonly LOW_PRIORITY: number

    private m_Timed_stack: StructuresArray
    private m_Others_stack: StructuresArray

    private m_Timed_indexes: Array<number>
    private m_Indexes: Array<number>

    constructor() {
        this.HIGH_PRIORITY = 0
        this.MED_PRIORITY = 1
        this.LOW_PRIORITY = 2

        this.m_Timed_indexes = new Array()
        this.m_Indexes = new Array()

        this.m_Timed_stack = this.InitStack()
        this.m_Others_stack = this.InitStack()
    }

    private InitStack(): StructuresArray {
        let stack: StructuresArray = new Array()
        stack[this.HIGH_PRIORITY] = new Array()
        stack[this.MED_PRIORITY] = new Array()
        stack[this.LOW_PRIORITY] = new Array()
        return stack
    }

    private GetPriorityLevel(struct: StructureWrapper<any>): number {
        let level

        const five_percent = .05
        const seventy_percent = .7

        const max_health = struct.GetMaxHealth()
        const cur_health = struct.GetCurHealth()

        if (cur_health < max_health * five_percent) {
            level = this.HIGH_PRIORITY
        }
        else if (cur_health < max_health * seventy_percent) {
            level = this.MED_PRIORITY
        }
        else {
            level = this.LOW_PRIORITY
        }

        return level
    }

    Add(struct: StructureWrapper<any>) {
        const level = this.GetPriorityLevel(struct)
        const struct_index = struct.GetCurHealth()

        if (struct.SignalRecieverType() === TIMED_STRUCTURE_TYPE) {
            if (this.m_Timed_stack[level].length === 0) {
                this.m_Timed_indexes[level] = struct_index
            }
            this.m_Timed_stack[level][struct_index] = struct
        }
        else {
            if (this.m_Others_stack[level].length === 0) {
                this.m_Indexes[level] = struct_index
            }
            this.m_Others_stack[level][struct_index] = struct
        }
    }

    Pop(): StructureWrapper<any> | undefined {
        const level_list = [
            this.HIGH_PRIORITY,
            this.MED_PRIORITY,
            this.LOW_PRIORITY
        ]

        let ret: StructureWrapper<any> | undefined

        for(let level of level_list) {
            let start_index = this.m_Timed_indexes[level]
            ret = this.m_Timed_stack[level][start_index]

            if (!ret) {
                start_index = this.m_Indexes[level]
                ret = this.m_Others_stack[level][start_index]
                break
            }
            else {
                break
            }
        }

        return ret
    }
} 