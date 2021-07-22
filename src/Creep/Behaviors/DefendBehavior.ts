import { ATTACK_DISTANCE } from "../../Constants/CreepBehaviorConsts";
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

        if(hostile_creeps.length > 0) {
            const x = hostile_creeps[0].pos.x
            const y = hostile_creeps[0].pos.y
            if (!creep.pos.inRangeTo(x, y, ATTACK_DISTANCE)) {
                creep.moveTo(hostile_creeps[0])
            }
            else {
                creep.attack(hostile_creeps[0])
            }
        }
        else if (hostile_creeps.length === 0) {
            creep.suicide()
        }
    }

}