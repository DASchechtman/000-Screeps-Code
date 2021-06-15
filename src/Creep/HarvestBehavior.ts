import { HardDrive } from "../Disk/HardDrive";
import { RoomWrapper } from "../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class HarvestBehavior implements CreepBehavior {

    private m_Source_id = ""

    Load(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        this.m_Source_id = String(data)
    }

    Behavior(creep: Creep, room: RoomWrapper): void {
        const source_id = this.m_Source_id as Id<Source>

        let source = Game.getObjectById(source_id)

        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES)
        }
        

        if (source) {
            const harvest_result = creep.harvest(source)
            this.m_Source_id = source.id

            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                const spawn = room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
                const deposit = creep.transfer(spawn, RESOURCE_ENERGY)

                if (deposit === ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn)
                }
            }
            else if (harvest_result === ERR_NOT_IN_RANGE) {
                creep.moveTo(source)
            }
        }

    }

    Save(creep: Creep): void { 
        HardDrive.Write(creep.name, this.m_Source_id)
    }

    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }

}