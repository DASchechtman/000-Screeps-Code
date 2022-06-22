import { Behavior } from "../../consts/CreepBehaviorConsts"
import { GameEntityTypes } from "../../consts/GameConstants"
import { SignalMessage } from "../../types/Interfaces"
import { ColonyMember } from "../ColonyMember"
import { CreepWrapper } from "../creep/CreepWrapper"

export class StructureWrapper<T extends StructureConstant> extends ColonyMember {

    private m_Repair_creep_id: string | null

    constructor(struct_id: string, type: GameEntityTypes = GameEntityTypes.STRUCT) {
        super(type, struct_id)
        this.m_Repair_creep_id = null
    }

    private GetWrapperStruct(): Structure<T> | null {
        const id = this.m_Id as Id<Structure<T>>
        return Structure.prototype.Get(id)
    }

    OnTickRun(): void {
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

    OnTickStart(): void { }

    OnTickEnd(): void { }

    OnDestroy(): void {}

    ReceiveSignal(signal: SignalMessage): boolean {
        let was_processed = false

        if (signal.sender.GetType() === GameEntityTypes.CREEP) {
            const creep = signal.sender as CreepWrapper
            if (
                creep.GetBehavior() === Behavior.REPAIR 
                && typeof signal.data === 'string'
                && this.m_Repair_creep_id !== signal.data
                ) 
            {
                this.m_Repair_creep_id = signal.data
                was_processed = true
            }
        }

        return was_processed
    }

    GetCurHealth(): number {
        const struct = this.GetWrapperStruct()
        return struct ? struct.CurHealth() : Number.MAX_SAFE_INTEGER
    }

    GetMaxHealth(): number {
        const struct = this.GetWrapperStruct()
        return struct ? struct.MaxHealth() : Number.MAX_SAFE_INTEGER
    }

    GetStructure(): Structure<T> | null {
        return this.GetWrapperStruct()
    }

    GetStructType(): StructureConstant | undefined {
        return this.GetWrapperStruct()?.structureType
    }
}