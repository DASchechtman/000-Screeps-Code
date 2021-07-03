import { HardDrive } from "../../Disk/HardDrive";
import { JsonObj } from "../../CompilerTyping/Interfaces";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { Container } from "../../CompilerTyping/Types";
import { CreepBehavior } from "./CreepBehavior";

export class HarvestBehavior extends CreepBehavior {
    private m_Data: JsonObj = {}

    Load(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        const cur_state = Boolean((data.behavior as JsonObj)?.full)
        this.m_Data = {
            id: String((data.behavior as JsonObj)?.id),
            full: this.UpdateWorkState(creep, cur_state)
        }
    }

    Run(creep: Creep, room: RoomWrapper): void {
        const source = this.GetEnergySource(creep)

        if (source) {
            this.m_Data.id = source.id

            if (this.m_Data.full) {
                const container = this.GetFreeContainer(room)
                this.DepositToContainer(creep, container)
            }
            else {
                this.Harvest(creep, source)
            }
        }

    }

    Save(creep: Creep): void {
        const save_data = HardDrive.Read(creep.name)
        save_data.behavior = this.m_Data  
        HardDrive.Write(creep.name, save_data)
    }

    protected UpdateWorkState(creep: Creep, cur_state: boolean): boolean {
        const resource_type = RESOURCE_ENERGY
        const used_cap = creep.store.getUsedCapacity(resource_type)
        const free_cap = creep.store.getFreeCapacity(resource_type)

        let state = cur_state

        if (used_cap === 0) {
            state = false
        }
        else if (free_cap === 0) {
            state = true
        }

        return state
    }

    private GetFreeContainer(room: RoomWrapper): Container {
        const spawn = room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        const extensions = room.GetOwnedStructures<StructureExtension>(STRUCTURE_EXTENSION)
        const free_containers = [spawn, ...extensions]

        let container: Container = spawn

        for (let storage of free_containers) {
            if (storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                container = storage
                break
            }
        }

        return container
    }

    private DepositToContainer(creep: Creep, container: Container) {
        const res = creep.transfer(container, RESOURCE_ENERGY)
        this.MoveTo(res, creep, container)
    }

    private GetEnergySource(creep: Creep): Source | null {
        const source_id = this.m_Data.id as Id<Source>

        let source = Game.getObjectById(source_id)

        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES)
        }
        return source
    }

}