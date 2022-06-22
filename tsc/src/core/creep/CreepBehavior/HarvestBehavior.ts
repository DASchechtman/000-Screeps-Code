import { ActionDistance } from "../../../consts/CreepBehaviorConsts"
import { EventTypes } from "../../../consts/GameConstants"
import { JsonObj } from "../../../types/Interfaces"
import { Container } from "../../../types/Types"
import { EventManager } from "../../../utils/event_handler/EventManager"
import { JsonMap } from "../../../utils/harddrive/JsonTreeNode"
import { CreepWrapper } from "../../creep/CreepWrapper"
import { RoomWrapper } from "../../room/RoomWrapper"
import { SourceWrapper } from "../../SourceWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class HarvestBehavior extends CreepBehavior {

    private b_full = false
    private s_source_id = ""
    private s_container_id = ""

    private readonly s_full_key = "full"
    private readonly s_source_id_key = "source id"
    private readonly s_container_id_key = "container id"

    constructor(wrapper: CreepWrapper, behavior_data: JsonMap) {
        super(wrapper, behavior_data)
    }

    InitCreep(creep: Creep): void {
        // just a test of the event management system. Will remove it in
        // future development iterations
        EventManager.GetInst().AddEventMethod(EventTypes.INVASION, this.OnInvasion)
    }

    InitTick(creep: Creep): void {
        this.b_full = this.GetJsonDataIfAvalible(this.s_full_key, this.b_full) as boolean
        this.s_source_id = this.GetJsonDataIfAvalible(this.s_source_id_key, this.s_source_id) as string
        this.s_container_id = this.GetJsonDataIfAvalible(this.s_container_id_key, this.s_container_id) as string
    }

    RunTick(creep: Creep, room: RoomWrapper): void {
        const source = this.GetEnergySource(creep, room)
        if (source) {
            this.s_source_id = source.id

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                this.b_full = false
            }
            else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity()) {
                this.b_full = true
            }

            if (this.b_full) {
                let id = this.s_container_id as Id<Container>
                let container = Game.getObjectById(id)

                if (!container || container.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                    this.SetFreeContainer(room)
                    id = this.s_container_id as Id<Container>
                    container = Game.getObjectById(id)!!

                }

                this.DepositToContainer(creep, container)
            }
            else {
                this.Harvest(source, room)
            }
        }

    }

    FinishTick(creep: Creep): void {
        this.StoreDataInJsonMap(
            [this.s_full_key, this.s_source_id_key, this.s_container_id_key],
            [this.b_full, this.s_source_id, this.s_container_id]
            )
    }

    DestroyCreep(creep: Creep | null): void {
        EventManager.GetInst().RemoveEventMethod(EventTypes.INVASION, this.OnInvasion)
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

        this.s_container_id = container.id
    }

    private DepositToContainer(creep: Creep, container: Container) {
        this.MoveTo(creep, container, ActionDistance.TRANSFER, () => {
            creep.transfer(container, RESOURCE_ENERGY)
        })
    }

    private GetEnergySource(creep: Creep, room: RoomWrapper): Source | null {
        const source_id = this.s_source_id as Id<Source>

        let source = Game.getObjectById(source_id ? source_id: "" as Id<Source>)

        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES)
            if (source && !new SourceWrapper(source!!.id).HasFreeSpot()) {
                source = this.GetSource(creep, room)
            }
        }
        return source
    }

    private OnInvasion() {
        
    }

}