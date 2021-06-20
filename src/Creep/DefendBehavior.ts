import { HardDrive } from "../Disk/HardDrive";
import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { Signal } from "../Signals/SignalManager";
import { CreepBehavior } from "./CreepBehavior";

export class DefendBehavior implements CreepBehavior {
    SignalTask(): ((signal: Signal, obj: GameObject) => boolean) | null {
        return null
    }
    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }
    Load(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }
    Save(creep: Creep): void {
        
    }
    Behavior(creep: Creep, room: RoomWrapper): void {
        const hostile_creeps = room.GetHostileCreeps()

        const res = creep.attack(hostile_creeps[0])

        if(res === ERR_NOT_IN_RANGE) {
            creep.moveTo(hostile_creeps[0])
        }
        else {
            creep.suicide()
        }
    }

}