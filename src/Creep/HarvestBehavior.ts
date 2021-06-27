import { Colony } from "../Colony/Colony";
import { HardDrive, JsonObj } from "../Disk/HardDrive";
import { RoomWrapper } from "../Room/RoomWrapper";
import { Method, Signal } from "../Signals/SignalManager";
import { CreepBehavior } from "./CreepBehavior";
import { CreepWrapper } from "./CreepWrapper";

export class HarvestBehavior implements CreepBehavior {
    private m_Source_id = ""
    private m_Transfered_all_energy = false

    SignalTask(): Method | null {
        return null
    }

    Load(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        this.m_Source_id = String((data.behavior as JsonObj).id)
        this.m_Transfered_all_energy = Boolean((data.behavior as JsonObj).empty)
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

            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                this.m_Transfered_all_energy = true
            }
            else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                this.m_Transfered_all_energy = false
            }

            if (this.m_Transfered_all_energy) {
                const spawn = room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
                const extensions = room.GetOwnedStructures<StructureExtension>(STRUCTURE_EXTENSION)

                const deposit_places = [spawn, ...extensions]

                let container: StructureSpawn | StructureExtension = deposit_places[0]

                for (let storage of deposit_places) {
                    if (storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        container = storage
                        break
                    }
                }

                const deposit = creep.transfer(container, RESOURCE_ENERGY)

                if (deposit === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container)
                }
            }
            else {
                creep.moveTo(source)
            }
        }

    }

    Save(creep: Creep): void {
        const data = HardDrive.Read(creep.name) as JsonObj

        const behavior_data: JsonObj = {
            id: this.m_Source_id,
            empty: this.m_Transfered_all_energy
        }
        
        data.behavior = behavior_data
        HardDrive.Write(creep.name, data)
    }

    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }

}