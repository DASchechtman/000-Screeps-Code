import { GameEntityTypes } from "../../consts/GameConstants";
import { SignalMessage } from "../../types/Interfaces";
import { BehaviorType } from "../../types/Types";
import { RoomWrapper } from "../room/RoomWrapper";
import { SpawnBehavior } from "./StructBehavior/SpawnBehavior";
import { StructBehavior } from "./StructBehavior/StructBehavior";
import { StructureWrapper } from "./StructureWrapper";

type BehaviorConstants = STRUCTURE_SPAWN | STRUCTURE_LINK | STRUCTURE_TOWER

export class BehaviorStructureWrapper<T extends BehaviorConstants> extends StructureWrapper<T> {
    private m_Behavior: StructBehavior | null = null
    private m_Behavior_types: Map<string, StructBehavior>

    constructor(struct: Id<Structure<T>>) {
        super(struct, GameEntityTypes.BEHAVIOR_STRUCT)

        this.m_Behavior_types = new Map()
        this.m_Behavior_types.set(STRUCTURE_SPAWN, new SpawnBehavior())

        const type = this.GetStructType()
        if (typeof type === 'string' && this.m_Behavior_types.has(type)) {
            this.m_Behavior = this.m_Behavior_types.get(type)!!
        }
    }


    OnTickRun(): void {
        super.OnTickRun()
        const struct = this.GetStructure()
        
        if (this.m_Behavior && struct) {
            const behavior_struct = struct as unknown as BehaviorType
            const room = new RoomWrapper(struct.room.name)
            this.m_Behavior?.InitTick(behavior_struct)
            this.m_Behavior?.RunTick(behavior_struct, room)
            this.m_Behavior?.FinishTick(behavior_struct)

            if (this.m_Behavior?.GetData()) {
                this.m_Signal = {
                    data: this.m_Behavior.GetData(),
                    sender: this,
                    receiver_type: GameEntityTypes.COLONY
                }
            }

            this.m_Behavior?.ClearData()
        }

    }
}