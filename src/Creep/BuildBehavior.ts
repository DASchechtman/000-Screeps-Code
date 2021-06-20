import { HardDrive, JsonObj } from "../Disk/HardDrive";
import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { Signal } from "../Signals/SignalManager";
import { CreepBehavior } from "./CreepBehavior";

export class BuildBehavior implements CreepBehavior {
    SignalTask(): ((signal: Signal, obj: GameObject) => boolean) | null {
        return null
    }

    private m_Can_build = false

    Load(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        this.m_Can_build = Boolean(data.behavior)
    }

    Behavior(creep: Creep, room: RoomWrapper): void {
        const sites = room.GetConstructionSites()

        if (sites.length > 0) {
            const build_site = sites[0]
            const source = room.GetSources()[0]

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                this.m_Can_build = false
            }
            else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY)) {
                this.m_Can_build = true
            }

            if (this.m_Can_build) {
                const res = creep.build(build_site)
                if (res === ERR_NOT_IN_RANGE) {
                    creep.moveTo(build_site)
                }
            }
            else {
                const res = creep.harvest(source)
                if (res === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source)
                }
            }
        }
        else {
            this.ClearDiskData(creep)
            creep.suicide()
        }
    }

    Save(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        data.behavior = this.m_Can_build
        HardDrive.Write(creep.name, data)
    }

    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }
}