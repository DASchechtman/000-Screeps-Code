import { HardDrive } from "../../Disk/HardDrive";
import { JsonObj } from "../../CompilerTyping/Interfaces";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";
import { CHANGE_SIGN_DISTANCE, UPGRADE_DISTANCE } from "../../Constants/CreepBehaviorConsts";

export class UpgradeBehavior extends CreepBehavior {
    private m_Data: JsonObj = {}

    Load(creep: Creep): void {
        const behavior = this.GetBehavior(creep)
        const cur_state = Boolean(behavior?.can_upgrade)
        this.m_Data = {
            can_upgrade: this.UpdateWorkState(creep, cur_state)
        }
    }

    Run(creep: Creep, room: RoomWrapper): void {
        const controller = room.GetController()

        if (controller) {
            const source = room.GetSources()[0]

            if (this.m_Data.can_upgrade === true) {
                this.Upgrade(creep, controller)
            }
            else if (this.m_Data.can_upgrade === false) {
                this.Harvest(creep, source)
            }
        }
    }

    Save(creep: Creep): void {
        const data = HardDrive.Read(creep.name) as JsonObj
        data.behavior = this.m_Data
        HardDrive.Write(creep.name, data)
    }

    Upgrade(creep: Creep, controller: StructureController) {

        let dist = UPGRADE_DISTANCE
        let change_sign = false

        const shield = "\u{1F6E1}\uFE0F"
        const cross_swords = "\u2694\uFE0F"
        const msg = `${shield} This room is under the protection of the DAS colony. ${cross_swords}`

        if (controller.sign?.text !== msg) {
            dist = CHANGE_SIGN_DISTANCE
            change_sign = true
        }

        if (!this.MoveTo(dist, creep, controller)) {
            if (change_sign) {
                creep.signController(controller, msg)
            }
            else {
                creep.upgradeController(controller)
            }
        }
    }

}