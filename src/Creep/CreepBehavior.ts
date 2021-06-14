import { RoomWrapper } from "../Room/RoomWrapper";

export interface CreepBehavior {
    Load(creep: Creep): void
    Behavior(creep: Creep, room: RoomWrapper): void
    Save(creep: Creep): void
    ClearDiskData(creep: Creep): void
}