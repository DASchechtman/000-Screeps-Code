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

    Load(creep: Creep): void {
        const behavior = HardDrive.ReadFolder(this.GetFolderPath(creep))
        const cur_state = Boolean(behavior?.can_upgrade)
        this.m_Data = {
            can_upgrade: this.UpdateWorkState(creep, cur_state)
        }
    }

    Run(creep: Creep, room: RoomWrapper): void {
        const controller = room.GetController()

        if (controller) {
            const source = this.GetSource(creep, room)

            if (this.m_Data.can_upgrade === true) {
                this.Upgrade(creep, controller)
            }
            else if (this.m_Data.can_upgrade === false) {
                this.Harvest(source)
            }
        }
    }

    Save(creep: Creep): void {
        HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data) 
    }

    Destroy(creep: Creep): void {}

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