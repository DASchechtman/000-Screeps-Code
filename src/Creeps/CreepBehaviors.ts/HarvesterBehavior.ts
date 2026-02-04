import { JsonObj } from "Consts";
import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFile, SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { FlipStateBasedOnEnergyInCreep } from "./Utils/CreepUtils";
import { EntityBehavior, EntityState, EntityStateManager } from "./BehaviorTypes";
import { BuildingAllocator } from "utils/BuildingAllocator";

type EnergyContainer = StructureSpawn | StructureExtension | StructureContainer | null
type Storage = Id<StructureSpawn | StructureExtension> | Id<StructureContainer>

class CreepState {
    protected creep_id: Id<Creep>
    protected creep: Creep | null

    constructor(id: Id<Creep>) {
        this.creep_id = id
        this.creep = null
    }

    protected GetCreep() {
        this.creep = Game.getObjectById(this.creep_id)
        return this.creep
    }

    protected GetContainer() {
        const CONTAINER = BuildingAllocator.GetStructureId(STRUCTURE_CONTAINER, this.creep_id)
        if (CONTAINER == null) { return null }
        return Game.getObjectById(CONTAINER)
    }
}

class DepositInContainerState extends CreepState implements EntityState {
    constructor(id: Id<Creep>){
        super(id)
    }

    RunState() {
        if (this.GetCreep() == null) { return false }

        const CREEP = this.creep!
        const CONTAINER = this.GetContainer()
        if (CONTAINER === null) { return true }

        const CREEP_X = CREEP.pos.x
        const CREEP_Y = CREEP.pos.y
        const CONTAINER_X = CONTAINER.pos.x
        const CONTAINER_Y = CONTAINER.pos.y

        if (CREEP_X !== CONTAINER_X || CREEP_Y !== CONTAINER_Y) {
            CREEP.moveTo(CONTAINER)
        }
        else {
            CREEP.transfer(CONTAINER, RESOURCE_ENERGY)
        }


        return true
    }

    GetNextState() {
        const CREEP = this.creep!
        const ENERGY_AMOUNT = CREEP.store.getUsedCapacity(RESOURCE_ENERGY)

        if (ENERGY_AMOUNT === 0) {
            return new HarvestEnergyState(this.creep_id)
        }

        return this
    }
}

class HarvestEnergyState extends CreepState implements EntityState {
    private container: StructureContainer | null
    private source: Source | null | undefined
    constructor(id: Id<Creep>) {
        super(id)
        this.container = null
        this.source = null
    }

    RunState() {
        if (this.GetCreep() === null) { return false }
        const CREEP = this.creep!
        this.container  = this.GetContainer()
        this.source = this.container?.pos.findClosestByPath(FIND_SOURCES)

        if (this.source == null) {
            this.source = CREEP.pos.findClosestByPath(FIND_SOURCES)
        }

        if (this.source == null) { return true }

        let ret = CREEP.harvest(this.source)
        if (ret === ERR_NOT_IN_RANGE || (ret === ERR_NOT_ENOUGH_ENERGY &&  this.container)) {
            CREEP.moveTo(this.container ? this.container : this.source)
        }

        return true
    }

    GetNextState(): EntityState {
        const FILLED = this.creep!.store.getFreeCapacity(RESOURCE_ENERGY) === 0
        if (FILLED) {
            if (this.container) {
                return new DepositInContainerState(this.creep_id)
            }
            else {
                return new StructureSupplyState(this.creep_id)
            }
        }
        return this
    }
}

class StructureSupplyState extends CreepState implements EntityState {
    constructor(id: Id<Creep>) {
        super(id)
    }

    RunState() {
        if (this.GetCreep() == null) { return false }

        const STRUCT_TYPES = <const> [
            STRUCTURE_SPAWN,
            STRUCTURE_EXTENSION
        ]
        const SUPPLY_STRUCT_IDS = RoomData.GetRoomData().GetOwnedStructureIds(...STRUCT_TYPES)
            .map(id => Game.getObjectById(id))
            .filter(s => s !== null)

        const STRUCT_MAP = new Map<StructureConstant, Array<StructureSpawn | StructureExtension>>()

        for (let struct of SUPPLY_STRUCT_IDS) {
            if (struct == null) { continue }
            if (!STRUCT_MAP.has(struct.structureType)) {
                STRUCT_MAP.set(struct.structureType, [])
            }
            STRUCT_MAP.get(struct.structureType)!.push(struct)
        }

        let target: StructureSpawn | StructureExtension | undefined
        for (let struct_type of STRUCT_TYPES) {
            target = STRUCT_MAP.get(struct_type)!.filter(s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0).at(0)
            if (target != null) { break }
        }

        if (target == null) { return true }

        let ret = this.creep!.transfer(target, RESOURCE_ENERGY)
        if (ret === ERR_NOT_IN_RANGE) {
            this.creep!.moveTo(target)
        }

        return true
    }

    GetNextState() {
        const CREEP = this.creep!
        const EMPTY = CREEP.store.getUsedCapacity(RESOURCE_ENERGY) === 0
        if (EMPTY) {
            return new HarvestEnergyState(this.creep_id)
        }
        return this
    }
}

export class HarvesterBehavior implements EntityBehavior {
    private static state_manager = new Map<Id<Creep>, EntityStateManager>()
    private static GetStateManager(id: Id<Creep>) {
        if (!this.state_manager.has(id)) {
            this.state_manager.set(id, new EntityStateManager(new HarvestEnergyState(id)))
        }

        return this.state_manager.get(id)!
    }

    private data: JsonObj
    private state_key: string
    private creep_id: string
    private creep: Creep | null
    private file: ScreepFile | null
    private sources: Source[]
    private spawns: EnergyContainer[]

    constructor() {
        this.data = {}
        this.state_key = "state"
        this.sources = []
        this.spawns = []
        this.creep_id = ""
        this.creep = null
        this.file = null
    }

    Load(file: ScreepFile, id: string) {
        this.creep_id = id
        this.creep = Game.getObjectById(this.creep_id as Id<Creep>)
        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        this.file = file

        if (this.creep !== null) {
            if (!this.data[this.state_key]) {
                this.sources = this.creep.room.find(FIND_SOURCES)
            }
        }

        return this.creep != null
    }

    Run() {
        const MANAGER = HarvesterBehavior.GetStateManager(this.creep_id as Id<Creep>)
        if (MANAGER.RunState(this.file!)) { MANAGER.GetNextState() }
    }

    Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
    }

    Unload(file: ScreepFile) {
        BuildingAllocator.RemoveStructureId(STRUCTURE_CONTAINER, this.creep_id)
        HarvesterBehavior.state_manager.delete(this.creep_id as Id<Creep>)
    }

}
