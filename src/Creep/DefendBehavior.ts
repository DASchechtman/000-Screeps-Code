import { HardDrive } from "../Disk/HardDrive";
import { RoomWrapper } from "../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class DefendBehavior implements CreepBehavior {
    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }
    Load(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }
    Save(creep: Creep): void {
        
    }
    Behavior(creep: Creep, room: RoomWrapper): void {
        throw new Error("Method not implemented.");
    }

}