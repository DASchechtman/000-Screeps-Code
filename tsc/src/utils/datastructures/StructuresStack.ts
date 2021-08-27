import { GameEntityTypes } from "../../consts/GameConstants"
import { StructureWrapper } from "../../core/StructureWrapper"
import { StructStackIndex } from "../../types/Interfaces"


export class StructuresStack {

    private m_Stack: Map<number, StructStackIndex>
    private m_Lowest_key: number
    
    constructor() {    
        this.m_Stack = new Map()
        this.m_Lowest_key = -1
    }

    private GetFirstElement(): {struct: StructureWrapper<any> | null, index: number} {

        let structure: StructureWrapper<any> | null = null
        let start_index = -1

        if (this.m_Stack.has(this.m_Lowest_key)) {
            const index = this.m_Stack.get(this.m_Lowest_key)!!

            if (index.array.length > 0) {
                structure = index.array[0]
                start_index = this.m_Lowest_key
            }
        }

        return { struct: structure, index: start_index }
    }

    private PushToStack(struct: StructureWrapper<any>, index: StructStackIndex): void {
        const is_timed = struct.GetType() === GameEntityTypes.DEGRADABLE_STRUCT
        const is_rampart = struct.GetStructure()?.structureType === STRUCTURE_RAMPART
 
        if (is_timed && is_rampart) {
            index.array.unshift(struct)
            index.timed_defense_index++
        }
        else if (is_timed) {
            const insert_index = index.timed_defense_index
            index.array.splice(insert_index, 0, struct)
        }
        else {
            index.array.push(struct)
        }
    }

    private CreateIndex(struct: StructureWrapper<any>): void {
        const new_index: StructStackIndex = {
            index: struct.GetCurHealth(),
            timed_defense_index: 0,
            array: new Array()
        }

        this.m_Stack.set(new_index.index, new_index)
        this.PushToStack(struct, this.m_Stack.get(new_index.index)!!)
    }

    Add(struct: StructureWrapper<any>): void {
        const key = struct.GetCurHealth()

        if (this.m_Stack.size === 0) {
            this.m_Lowest_key = key
            this.CreateIndex(struct)
        }
        else {
            if (this.m_Stack.has(key)) {
                this.PushToStack(struct, this.m_Stack.get(key)!!)
            }
            else {
                if (key < this.m_Lowest_key!!) {
                    this.m_Lowest_key = key
                }

                this.CreateIndex(struct)
            }
        }
        
    }

    Peek(): StructureWrapper<any> | null {
        return this.GetFirstElement().struct
    }

    Pop(): StructureWrapper<any> | null {
        const first_el_obj = this.GetFirstElement()
        const struct = first_el_obj.struct


        if (first_el_obj.index > -1) {
            this.m_Stack.get(first_el_obj.index)?.array.shift()
        }

        return struct
    }
} 