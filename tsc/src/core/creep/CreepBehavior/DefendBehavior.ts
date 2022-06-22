import { ActionDistance } from "../../../consts/CreepBehaviorConsts"
import { JsonMap } from "../../../utils/harddrive/JsonTreeNode"
import { CreepWrapper } from "../../creep/CreepWrapper"
import { RoomWrapper } from "../../room/RoomWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class DefendBehavior extends CreepBehavior {

    constructor(wrapper: CreepWrapper, behavior_data: JsonMap) {
        super(wrapper, behavior_data)
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