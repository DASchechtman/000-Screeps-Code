import { HardDrive } from "../../Disk/HardDrive";
import { JsonObj } from "../../CompilerTyping/Interfaces";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

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
        const controller = room.GetOwnedStructures<StructureController>(STRUCTURE_CONTROLLER)[0]
        const source = room.GetSources()[0]
        
        if (this.m_Data.can_upgrade === true) {
            this.Upgrade(creep, controller)
        }
        else if (this.m_Data.can_upgrade === false) {
            this.Harvest(creep, source)
        }
    }

    Save(creep: Creep): void {
        const data = HardDrive.Read(creep.name) as JsonObj
        data.behavior = this.m_Data
        HardDrive.Write(creep.name, data)
    }

    Upgrade(creep: Creep, controller: StructureController) {
        this.MoveTo(creep.upgradeController(controller), creep, controller)
    }

}