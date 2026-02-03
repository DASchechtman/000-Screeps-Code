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

    constructor() {
        this.creep = null
        this.source = null
        this.tower_id_key = "tower to supply"
        this.state_key = "state"
        this.energy_source_key = "from container"
        this.data = {}
        this.id = ""
    }

    Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        this.id = id
        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        this.data[this.tower_id_key] = SafeReadFromFileWithOverwrite(file, this.tower_id_key, 'null')
        this.data[this.energy_source_key] = SafeReadFromFileWithOverwrite(file, this.energy_source_key, 'null')
        const HAS_CREEP = this.creep != null

        if (this.creep && !this.source) {
            this.source = this.creep.room.find(FIND_SOURCES)[1]
        }

        if (this.data[this.tower_id_key] === 'null') {
            const TOWER_ID = TowerBehavior.GetTowerId(id)
            if (TOWER_ID != null) {
                 this.data[this.tower_id_key] = TOWER_ID
            }
        }

        const TIMER = new Timer(id)
        TIMER.StartTimer(15)

        if (this.data[this.energy_source_key] === 'null' || TIMER.IsTimerDone()) {
            if (!HAS_CREEP) { return false }
            this.data[this.energy_source_key] = GetContainerIdIfThereIsEnoughStoredEnergy(this.creep!)
            if (this.data[this.energy_source_key] === 'null') {
                this.data[this.energy_source_key] = 'N/A'
            }
        }

        return HAS_CREEP
    }

    Run() {
        if (this.creep == null) { return }
        this.data[this.state_key] = FlipStateBasedOnEnergyInCreep(this.creep, this.data[this.state_key] as boolean)

        if (!this.data[this.state_key]) {
            if (this.source == null) { return }
            let container = Game.getObjectById(this.data[this.energy_source_key] as Id<StructureContainer>)
            GetEnergy(this.creep, this.source, null, container)
        }
        else {
            const TEST = RoomData.GetRoomData().GetOwnedStructureIds()
            const STRUCTS = RoomData.GetRoomData().GetOwnedStructureIds([
                STRUCTURE_SPAWN,
                STRUCTURE_EXTENSION,
                STRUCTURE_TOWER
            ])
                .map(id => Game.getObjectById(id))
                .filter((s) => {
                    if (s) {
                        return s.store.getUsedCapacity(RESOURCE_ENERGY) < s.store.getCapacity(RESOURCE_ENERGY)
                    }
                    return false
                })
                .sort(SortStructs)
            const STRUCT = STRUCTS.at(0)
            if (STRUCT == null) { return }

            if (this.creep.transfer(STRUCT, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(STRUCT)
            }
        }
    }

    Cleanup(file: ScreepFile) {
        file.WriteAllToFile([
            {key: this.state_key, value: this.data[this.state_key]},
            {key: this.tower_id_key, value: this.data[this.tower_id_key]},
            {key: this.energy_source_key, value: this.data[this.energy_source_key]}
        ])
    }

    Unload(file: ScreepFile) {
        TowerBehavior.RemoveTowerId(this.id)
    }

}
