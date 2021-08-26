import { Behavior } from "../consts/CreepBehaviorConsts"
import { GameEntityTypes } from "../consts/GameConstants"
import { SignalMessage } from "../types/Interfaces"
import { ColonyMember } from "./ColonyMember"
import { CreepWrapper } from "./CreepWrapper"

export class StructureWrapper<T extends StructureConstant> extends ColonyMember {

    private m_Repair_creep_id: string | null

    constructor(struct_id: string) {
        let catagory = GameEntityTypes.ERROR
        const struct = Game.getObjectById(struct_id as Id<Structure<T>>)
        const timed_types: Array<StructureConstant> = [STRUCTURE_RAMPART, STRUCTURE_CONTAINER, STRUCTURE_ROAD]
        const behavior_types: Array<StructureConstant> = [STRUCTURE_TOWER, STRUCTURE_LINK]

        if (struct) {

            if (timed_types.includes(struct.structureType)) {
                catagory = GameEntityTypes.TIMED_STRUCTURE
            }
            else if (behavior_types.includes(struct.structureType)) {
                catagory = GameEntityTypes.BEHAVIOR_STRUCT
            }
            else {
                catagory = GameEntityTypes.STRUCT
            }
        }
       

        super(catagory, struct_id)
        this.m_Repair_creep_id = null
    }

    private ConvertNanToNum(val: number | null | undefined): number {
        let num_val = Number.MAX_SAFE_INTEGER
        if (typeof val === 'number' && val > 0) {
            num_val = val
        }
        return num_val
    }

    private GetWrapperStruct(): Structure<T> | null {
        const id = this.m_Id as Id<Structure<T>>
        return Game.getObjectById(id)
    }

    OnRun(): void {
        if (this.GetCurHealth() < this.GetMaxHealth()) {
            this.m_Signal = {
                data: Behavior.REPAIR,
                sender: this,
            }

            if (this.m_Repair_creep_id) {
                this.m_Signal.reciever_name = this.m_Repair_creep_id
            }
            else {
                this.m_Signal.receiver_type = GameEntityTypes.CREEP
            }
        }
     }

    OnLoad(): void { }

    OnSave(): void { }

    OnDestroy(): void {}

    ReceiveSignal(signal: SignalMessage): boolean {
        let was_processed = false

        if (signal.sender.GetType() === GameEntityTypes.CREEP) {
            const creep = signal.sender as CreepWrapper
            if (
                creep.GetBehavior() === Behavior.REPAIR 
                && typeof signal.data === 'string'
                && this.m_Repair_creep_id !== signal.data
                ) {
                this.m_Repair_creep_id = signal.data
                was_processed = true
            }
        }

        return was_processed
    }

    GetCurHealth(): number {
        return this.ConvertNanToNum(this.GetWrapperStruct()?.hits)
    }

    GetMaxHealth(): number {
        return this.ConvertNanToNum(this.GetWrapperStruct()?.hitsMax)
    }

    GetStructure(): Structure<T> | null {
        return this.GetWrapperStruct()
    }

    GetStructType(): StructureConstant | undefined {
        return this.GetWrapperStruct()?.structureType
    }
}