import { SignalMessage } from "../../../types/Interfaces";
import { BehaviorType } from "../../../types/Types";
import { RoomWrapper } from "../../room/RoomWrapper";



export abstract class StructBehavior {
    protected m_Data: unknown | null = null

    abstract InitTick(struct: BehaviorType): void
    abstract RunTick(struct: BehaviorType, room: RoomWrapper): void
    abstract FinishTick(struct: BehaviorType): void

    GetData(): unknown | null {
        return this.m_Data
    }

    ClearData(): void {
        this.m_Data = null
    }
}