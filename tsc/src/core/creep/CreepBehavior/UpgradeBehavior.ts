import { ActionDistance } from "../../../consts/CreepBehaviorConsts"
import { JsonObj } from "../../../types/Interfaces"
import { JsonMap, JsonTreeNode } from "../../../utils/harddrive/JsonTreeNode"
import { CreepWrapper } from "../../creep/CreepWrapper"
import { RoomWrapper } from "../../room/RoomWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class UpgradeBehavior extends CreepBehavior {
    private readonly s_can_upgrade = "can upgrade"
    private readonly s_id = "id"
    private b_can_upgrade = false
    private s_id_val = ""

    constructor(wrapper: CreepWrapper, behavior_data: JsonMap) {
        super(wrapper, behavior_data)
    }

    InitCreep(creep: Creep): void {}

    InitTick(creep: Creep): void {
        this.b_can_upgrade = this.GetJsonDataIfAvalible(this.s_can_upgrade, this.b_can_upgrade) as boolean
        this.s_id_val = this.GetJsonDataIfAvalible(this.s_id, this.s_id_val) as string
    }

    RunTick(creep: Creep, room: RoomWrapper): void {
        const controller = room.GetController()

        if (controller) {
            let source = Game.getObjectById(this.s_id_val as Id<Source>)

            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES)
                this.s_id_val = String(source?.id)
            }

            const used_capacity = creep.store.getUsedCapacity(RESOURCE_ENERGY)
            const max_capacity = creep.store.getCapacity()
            let should_upgrade = false

            if (used_capacity === 0) {
                this.b_can_upgrade = false
            }
            else if (used_capacity === max_capacity) {
                this.b_can_upgrade = true
            }

            if (this.b_can_upgrade && controller) {
                this.Upgrade(creep, controller)
            }
            else if (source) {
                this.Harvest(source, room)
            }

        }
    }

    FinishTick(creep: Creep): void {
        this.StoreDataInJsonMap(
            [this.s_can_upgrade, this.s_id],
            [this.b_can_upgrade, this.s_id_val]
        )
    }

    DestroyCreep(creep: Creep | null): void {}

    Upgrade(creep: Creep, controller: StructureController) {

        let dist = ActionDistance.UPGRADE

        const shield = "\u{1F6E1}\uFE0F"
        const cross_swords = "\u2694\uFE0F"
        const msg = `${shield} This room is under the protection of the DAS colony. ${cross_swords}`

        if (controller.sign?.text !== msg) {
            dist = ActionDistance.CHANGE_SIGN
        }

        this.MoveTo(creep, controller, dist, () => {
            if (dist === ActionDistance.CHANGE_SIGN) {
                creep.signController(controller, msg)
            }
            else {
                creep.upgradeController(controller)
            }
        })
        
    }

}