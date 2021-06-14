import { HardDrive, JsonObj } from "../Disk/HardDrive";
import { RoomWrapper } from "../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class UpgradeBehavior implements CreepBehavior {
    private m_Should_upgrade: boolean | null = null

    Load(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        this.m_Should_upgrade = Boolean(data)
    }

    Behavior(creep: Creep, room: RoomWrapper): void {
        const controller = room.GetOwnedStructures<StructureController>(STRUCTURE_CONTROLLER)[0]
        const source = room.GetSources()[0]
        const cur_capacity = creep.store.getUsedCapacity(RESOURCE_ENERGY)
        const max_capacity = creep.store.getCapacity(RESOURCE_ENERGY)

        if (cur_capacity === 0) {
            this.m_Should_upgrade = false
        }
        else if (max_capacity === cur_capacity) {
            this.m_Should_upgrade = true
        }

        if (this.m_Should_upgrade === true) {
            const res = creep.upgradeController(controller)

            if (res === ERR_NOT_IN_RANGE) {
                creep.moveTo(controller)
            }
        }
        else if (this.m_Should_upgrade === false) {
            const res = creep.harvest(source)

            if (res === ERR_NOT_IN_RANGE) {
                creep.moveTo(source)
            }
        }
    }

    Save(creep: Creep): void {
        HardDrive.Write(creep.name, this.m_Should_upgrade)
    }

    Destroy(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }

}