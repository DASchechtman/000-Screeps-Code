import { HardDrive } from "../Disk/HardDrive";
import { RoomWrapper } from "../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class BuildBehavior implements CreepBehavior {

    private m_Can_build = false
    
    Load(creep: Creep): void {
        this.m_Can_build = Boolean(HardDrive.Read(creep.name))
    }
    
    Behavior(creep: Creep, room: RoomWrapper): void {
        const sites = room.GetConstructionSites()
        
        if (sites.length > 0) {
            const build_site = sites[0]
            const source = room.GetSources()[0]

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                this.m_Can_build = false
            }
            else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY)){
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
        HardDrive.Write(creep.name, this.m_Can_build)
    }

    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }
}