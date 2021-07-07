import { StructStackIndex } from "../CompilerTyping/Interfaces"
import { TIMED_STRUCTURE_TYPE } from "../Constants/GameObjectConsts"
import { StructureWrapper } from "../Structure/StructureWrapper"

export class StructuresStack {

    private stack: Array<StructStackIndex>
    
    constructor() {    
        this.stack = new Array()
    }

    private GetFirstElement(): {struct: StructureWrapper<any> | null, index: number} {

        const SortLowestToHighestIndex = (struct_a: StructStackIndex, struct_b: StructStackIndex) => {
            let sort_order = 0
            if (struct_a.index < struct_b.index) {
                sort_order = -1
            }
            else if (struct_a.index > struct_b.index) {
                sort_order = 1
            }
            return sort_order
        }

        this.stack.sort(SortLowestToHighestIndex)

        let structure: StructureWrapper<any> | null = null
        let start_index = -1

        const stack_has_indexes = this.stack.length > 0
        if (stack_has_indexes) {
            const index_has_elements = this.stack[0].array.length > 0
            if (index_has_elements) {
                structure = this.stack[0].array[0]
                start_index = 0
            }
        }

        return { struct: structure, index: start_index }
    }

    private PushToStack(struct: StructureWrapper<any>, index: StructStackIndex): void {
 
        if (struct.SignalRecieverType() === TIMED_STRUCTURE_TYPE) {
            index.array.unshift(struct)
        }
        else {
            index.array.push(struct)
        }
    }

    private CreateIndex(struct: StructureWrapper<any>, index_in_stack: number): void {
        const new_index: StructStackIndex = {
            index: struct.GetCurHealth(),
            array: new Array()
        }

        this.stack.splice(index_in_stack, 0 , new_index)
        this.PushToStack(struct, this.stack[index_in_stack])
    }

    Add(struct: StructureWrapper<any>): void {

        if (this.stack.length === 0) {
            this.CreateIndex(struct, 0)
        }
        else {
            let added = false
            for(let i = 0; i < this.stack.length; i++) {
                const index = this.stack[i]
                if (struct.GetCurHealth() === index.index) {
                    this.PushToStack(struct, index)
                    added = true
                    break
                }
            }

            if (!added) {
                this.CreateIndex(struct, this.stack.length-1)
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
            this.stack[first_el_obj.index].array.shift()
        }

        return struct
    }
} 