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

        

        if(hostile_creeps.length > 0 && !this.MoveTo(1, creep, hostile_creeps[0])) {
            creep.moveTo(hostile_creeps[0])
        }
        else if (hostile_creeps.length === 0) {
            creep.suicide()
        }
    }

}