import { ActionDistance } from "../../consts/CreepBehaviorConsts"
import { JsonObj, SignalMessage } from "../../types/Interfaces"
import { HardDrive } from "../../utils/harddrive/HardDrive"
import { CreepWrapper } from "../CreepWrapper"
import { RoomWrapper } from "../room/RoomWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class UpgradeBehavior extends CreepBehavior {
    private m_Data: JsonObj = {}

    constructor(wrapper: CreepWrapper) {
        super(wrapper)
    }

    InitCreep(creep: Creep): void {}

    InitTick(creep: Creep): void {
        const behavior = HardDrive.ReadFolder(this.GetFolderPath(creep))
        const cur_state = Boolean(behavior?.can_upgrade)
        const id = String(behavior?.id)
        this.m_Data = {
            can_upgrade: this.UpdateWorkState(creep, cur_state),
            id: id
        }
    }

    RunTick(creep: Creep, room: RoomWrapper): void {
        const controller = room.GetController()

        if (controller) {
            let source = Game.getObjectById(this.m_Data.id as Id<Source>)

            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES)
                this.m_Data.id = String(source?.id)
            }

            if (this.m_Data.can_upgrade === true) {
                this.Upgrade(creep, controller)
            }
            else if (this.m_Data.can_upgrade === false && source) {
                this.Harvest(source, room)
            }
        }
    }

    FinishTick(creep: Creep): void {
        HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data) 
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

        if (!this.MoveTo(dist, controller)) {
            if (dist === ActionDistance.CHANGE_SIGN) {
                creep.signController(controller, msg)
            }
            else {
                creep.upgradeController(controller)
            }
        }
    }

}