import { HardDrive } from "../../Disk/HardDrive";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class DefendBehavior extends CreepBehavior {
   
    Load(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }

    Save(creep: Creep): void {}

    Run(creep: Creep, room: RoomWrapper): void {
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