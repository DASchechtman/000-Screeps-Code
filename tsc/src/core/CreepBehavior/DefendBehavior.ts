import { ActionDistance } from "../../consts/CreepBehaviorConsts"
import { SignalMessage } from "../../types/Interfaces"
import { HardDrive } from "../../utils/harddrive/HardDrive"
import { CreepWrapper } from "../CreepWrapper"
import { RoomWrapper } from "../room/RoomWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class DefendBehavior extends CreepBehavior {

    constructor(wrapper: CreepWrapper) {
        super(wrapper)
    }

    InitCreep(creep: Creep): void {}
   
    InitTick(creep: Creep): void {}

    FinishTick(creep: Creep): void {}

    RunTick(creep: Creep, room: RoomWrapper): void {
        const hostile_creeps = room.GetHostileCreeps()

        if(hostile_creeps.length > 0) {
            const x = hostile_creeps[0].pos.x
            const y = hostile_creeps[0].pos.y
            if (!creep.pos.inRangeTo(x, y, ActionDistance.ATTACK)) {
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

    DestroyCreep(creep: Creep | null): void {}

}