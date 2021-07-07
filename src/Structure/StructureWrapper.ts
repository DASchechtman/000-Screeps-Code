import { Signal } from "../CompilerTyping/Interfaces";
import { REPAIR_BEHAVIOR } from "../Constants/CreepBehaviorConsts";
import { CREEP_TYPE, STRUCTURE_TYPE } from "../Constants/GameObjectConsts";
import { CreepWrapper } from "../Creep/CreepWrapper";
import { GameObject } from "../GameObject";
import { SignalManager } from "../Signals/SignalManager";



export class StructureWrapper<T extends StructureConstant> extends GameObject {

    protected m_Struct_id: Id<Structure<T>>
    protected m_Struct: Structure<T> | null
    protected m_Cur_health: number
    protected m_Max_health: number

    constructor(struct_id: string, type: number = STRUCTURE_TYPE) {
        super(struct_id, type)
        
        
        this.m_Struct_id = struct_id as Id<Structure<T>>
        this.m_Struct = Game.getObjectById(this.m_Struct_id)

        this.m_Cur_health = 0
        this.m_Max_health = 0

        if (this.m_Struct) {
            this.m_Cur_health = this.m_Struct.hits
            this.m_Max_health = this.m_Struct.hitsMax
        }
    }

    OnLoad(): void {
        if (this.m_Cur_health < this.m_Max_health) {
            const signal: Signal = {
                from: this,
                data: {},
                filter: (sender, reciever): boolean => {
                    const type = reciever.SignalRecieverType()
                    let ret = false

                    if (type === CREEP_TYPE) {
                        const creep = reciever as CreepWrapper
                        ret = (creep.GetBehavior() === REPAIR_BEHAVIOR)
                    }

                    return ret
                }
            }

            SignalManager.Inst().SendSignal(signal)
        }
    }

    GetCurHealth(): number {
        return this.m_Cur_health
    }

    GetMaxHealth(): number {
        return this.m_Max_health
    }

    GetStructure(): Structure<T> | null {
        return this.m_Struct
    }
}