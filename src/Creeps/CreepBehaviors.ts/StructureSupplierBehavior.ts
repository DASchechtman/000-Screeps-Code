import { ScreepFile } from "FileSystem/File";
import { EntityBehavior } from "./BehaviorTypes";
import { JsonObj } from "Consts";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { TowerBehavior } from "./TowerBehavior";
import { FlipStateBasedOnEnergyInCreep, GetContainerIdIfThereIsEnoughStoredEnergy, GetEnergy } from "./Utils/CreepUtils";
import { Timer } from "utils/Timer";
import { RoomData } from "Rooms/RoomData";
import { BuildingAllocator } from "utils/BuildingAllocator";


type StorageStruct = StructureSpawn | StructureExtension | StructureTower | null

function SortStructs(a: StorageStruct, b: StorageStruct) {
    if (a == null || b == null) { return 0 }

    const HIGH_PRIO_STRUCTS = new Array<StructureConstant>()
    HIGH_PRIO_STRUCTS.push(STRUCTURE_SPAWN, STRUCTURE_EXTENSION)

    if (a.structureType === STRUCTURE_SPAWN) {
        return -1
    }
    else if (a.structureType === STRUCTURE_TOWER && HIGH_PRIO_STRUCTS.includes(b.structureType)) {
        return 1
    }
    else if (a.structureType === STRUCTURE_EXTENSION && b.structureType === STRUCTURE_TOWER) {
        return -1
    }


    return 0
}

export class StructureSupplierBehavior implements EntityBehavior {
    private creep: Creep | null
    private source: Source | null
    private tower_id_key: string
    private state_key: string
    private energy_source_key: string
    private data: JsonObj
    private id: string
    private extensions_ids_key: string
    private num_of_extensions_key: string

    constructor() {
        this.creep = null
        this.source = null
        this.tower_id_key = "tower to supply"
        this.state_key = "state"
        this.energy_source_key = "from container"
        this.data = {}
        this.id = ""
        this.extensions_ids_key = 'ordered extension ids'
        this.num_of_extensions_key = "num of extension"
    }

    Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        this.id = id
        let harvest_state: boolean = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        let tower_id: string = SafeReadFromFileWithOverwrite(file, this.tower_id_key, 'null')
        let energy_source: string = SafeReadFromFileWithOverwrite(file, this.energy_source_key, 'null')
        let extension_id_list: Array<Id<StructureExtension>> = SafeReadFromFileWithOverwrite(file, this.extensions_ids_key, [])
        let num_of_extensions: number = RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_EXTENSION).length
        const HAS_CREEP = this.creep != null

        if (extension_id_list.length === 0 || num_of_extensions !== extension_id_list.length) {
            const EXTENSION_IDS = RoomData.GetRoomData().GetRoomStructures(STRUCTURE_EXTENSION)
                .map(id => Game.getObjectById(id))
                .sort((a, b) => {
                    if (a == null || b == null) { return 0}
                    const Distance = (pos: RoomPosition) => {
                        return Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2))
                    }

                    return Distance(b.pos) - Distance(a.pos)
                })
            extension_id_list = EXTENSION_IDS.map(s => s?.id).filter(s => s != null) as Id<StructureExtension>[]
            num_of_extensions = extension_id_list.length
        }

        if (this.creep && !this.source) {
            this.source = this.creep.room.find(FIND_SOURCES)[1]
        }

        if (tower_id === 'null') {
            const TOWER_ID = TowerBehavior.GetTowerId(id)
            if (TOWER_ID != null) {
                 tower_id = TOWER_ID
            }
        }

        const TIMER = new Timer(id)
        TIMER.StartTimer(15)

        if (energy_source === 'null' || TIMER.IsTimerDone()) {
            if (!HAS_CREEP) { return false }
            energy_source = GetContainerIdIfThereIsEnoughStoredEnergy(this.creep!)
            if (energy_source === 'null') {
                energy_source = 'N/A'
            }
        }

        this.data[this.state_key] = harvest_state
        this.data[this.tower_id_key] = tower_id
        this.data[this.energy_source_key] = energy_source
        this.data[this.extensions_ids_key] = extension_id_list
        this.data[this.num_of_extensions_key] = num_of_extensions

        return HAS_CREEP
    }

    Run() {
        if (this.creep == null) { return }
        let state = FlipStateBasedOnEnergyInCreep(this.creep, this.data[this.state_key] as boolean)
        let container_id = this.data[this.energy_source_key]

        if (!state) {
            if (this.source == null) { return }
            let container = Game.getObjectById(container_id as Id<StructureContainer>)
            GetEnergy(this.creep, this.source, null, container)
        }
        else {
            const TEST = RoomData.GetRoomData().GetOwnedStructureIds()
            const STRUCTS = [
                ...RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_SPAWN).map(id => Game.getObjectById(id)),
                ...(this.data[this.extensions_ids_key] as Array<Id<StructureExtension>>).map(id => Game.getObjectById(id)),
                ...RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_TOWER).map(id => Game.getObjectById(id))
            ]
            .filter(s => s != null && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)

            const STRUCT = STRUCTS.at(0)
            if (STRUCT == null) { return }

            if (this.creep.transfer(STRUCT, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(STRUCT)
            }
        }

        this.data[this.state_key] = state
    }

    Cleanup(file: ScreepFile) {
        file.WriteAllToFile([
            {key: this.state_key, value: this.data[this.state_key]},
            {key: this.tower_id_key, value: this.data[this.tower_id_key]},
            {key: this.energy_source_key, value: this.data[this.energy_source_key]},
            {key: this.extensions_ids_key, value: this.data[this.extensions_ids_key]},
            {key: this.num_of_extensions_key, value: this.data[this.num_of_extensions_key]}
        ])
    }

    Unload(file: ScreepFile) {
        TowerBehavior.RemoveTowerId(this.id)
    }

}
