import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { Method, Signal } from "../Signals/SignalManager";

export interface CreepBehavior {
    Load(creep: Creep): void
    Behavior(creep: Creep, room: RoomWrapper): void
    Save(creep: Creep): void
    ClearDiskData(creep: Creep): void
    SignalTask(): Method | null
}