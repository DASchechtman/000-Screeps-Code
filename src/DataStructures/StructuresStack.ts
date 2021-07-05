import { StructStackIndex } from "../CompilerTyping/Interfaces"
import { TIMED_STRUCTURE_TYPE } from "../Constants/GameObjectConsts"
import { StructureWrapper } from "../Structure/StructureWrapper"

export class StructuresStack {

    private stack: Array<StructStackIndex>
    
    constructor() {    
        this.stack = new Array()
    }

    private GetFirstElement(): Array<StructureWrapper<any> | number | null> {
        let structure: StructureWrapper<any> | null = null
        let struct_index = 0

        const group = this.stack[0]
        const element = group?.array[0]

        if (group && element) {
            structure = element
        }
        else {
            struct_index = -1
        }

        return [structure, struct_index]
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
            let stack_index = 0
            while(stack_index < this.stack.length) {
                const el = this.stack[stack_index]
                if (struct.GetCurHealth() <= el.index) {
                    break
                }
                stack_index++
            }

            if (stack_index === this.stack.length) {
                this.CreateIndex(struct, stack_index-1)
            }
            else if (this.stack[stack_index].index === struct.GetCurHealth()) {
                this.PushToStack(struct, this.stack[stack_index])
            }
            else {
                this.CreateIndex(struct, stack_index)
            }

            
        }
        

        
    }

    Peek(): StructureWrapper<any> | null {
        return this.GetFirstElement()[0] as StructureWrapper<any> | null
    }

    Pop(): StructureWrapper<any> | null {
        const list = this.GetFirstElement()
        const struct = list[0] as StructureWrapper<any> | null


        if (list[1] as number > -1) {
            this.stack[list[1] as number].array.splice(0, 1)
        }

        return struct
    }
} 