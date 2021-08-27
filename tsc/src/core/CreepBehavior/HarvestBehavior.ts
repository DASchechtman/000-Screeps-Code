import { ActionDistance } from "../../consts/CreepBehaviorConsts"
import { JsonObj, SignalMessage } from "../../types/Interfaces"
import { Container } from "../../types/Types"
import { HardDrive } from "../../utils/harddrive/HardDrive"
import { CreepWrapper } from "../CreepWrapper"
import { RoomWrapper } from "../room/RoomWrapper"
import { SourceWrapper } from "../SourceWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class HarvestBehavior extends CreepBehavior {
    private m_Data: JsonObj = {}

    constructor(wrapper: CreepWrapper) {
        super(wrapper)
    }

    Load(creep: Creep): void {
        const behavior = HardDrive.ReadFolder(this.GetFolderPath(creep))
        const cur_state = Boolean(behavior?.full)
        const free_container = String(behavior?.free_container)
        this.m_Data = {
            id: String(behavior?.id),
            full: this.UpdateWorkState(creep, cur_state),
            free_container: free_container,
            "test-data": "testing testing 1, 2, 3"
        }
    }

    Run(creep: Creep, room: RoomWrapper): void {
        const source = this.GetEnergySource(creep, room)
        if (source) {
            this.m_Data.id = source.id

            if (this.m_Data.full) {
                let id = this.m_Data.free_container as Id<Container>
                let container = Game.getObjectById(id)

                if (!container || container.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                    this.SetFreeContainer(room)
                    id = this.m_Data.free_container as Id<Container>
                    container = Game.getObjectById(id)!!

                }

                this.DepositToContainer(creep, container)
            }
            else {
                this.Harvest(source)
            }
        }

    }

    Save(creep: Creep): void {
        HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data)
    }

    Destroy(creep: Creep): void {}

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

    private SetFreeContainer(room: RoomWrapper): void {
        const spawn = room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        const extensions = room.GetOwnedStructures<StructureExtension>(STRUCTURE_EXTENSION)
        const towers = room.GetOwnedStructures<StructureTower>(STRUCTURE_TOWER)
        const free_containers = [spawn, ...extensions, ...towers]

        let container: Container = spawn

        for (let storage of free_containers) {
            if (storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                container = storage
                break
            }
        }

        this.m_Data.free_container = container.id
    }

    private DepositToContainer(creep: Creep, container: Container) {
        if (!this.MoveTo(ActionDistance.TRANSFER, container)) {
            creep.transfer(container, RESOURCE_ENERGY)
        }
    }

    private GetEnergySource(creep: Creep, room: RoomWrapper): Source | null {
        const source_id = this.m_Data?.id as Id<Source>

        let source = Game.getObjectById(source_id ? source_id: "" as Id<Source>)

        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES)
            if (source && !new SourceWrapper(source!!.id).HasFreeSpot()) {
                source = this.GetSource(creep, room)
            }
        }
        return source
    }

}