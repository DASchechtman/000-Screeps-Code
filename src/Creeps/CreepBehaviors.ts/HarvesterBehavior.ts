import { JsonObj } from "Consts";
import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { FlipStateBasedOnEnergyInCreep } from "./Utils/CreepUtils";
import { EntityBehavior } from "./BehaviorTypes";
import { BuildingAllocator } from "utils/BuildingAllocator";

type EnergyContainers = StructureSpawn | StructureExtension | StructureContainer

function GetEnergyStorageTargets(id: string) {
    const CONTAINER_ID = BuildingAllocator.GetStructureId(STRUCTURE_CONTAINER, id)
    let x = [
        ...RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]),
        CONTAINER_ID
    ]
        .map(id => Game.getObjectById(String(id) as Id<Structure>))
        .filter(s => s != null)
        .sort((a, b) => {
            if (a == null || b === null) {
                return 0
            }

            const IsOtherStorageStructure = (struct_types: StructureConstant[]) => {
                return struct_types.includes(b.structureType)
            }
            let x = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]


            if (a.structureType === STRUCTURE_SPAWN) {
                return -1
            }
            else if (a.structureType === STRUCTURE_CONTAINER && IsOtherStorageStructure(x)) {
                return 1
            }
            return 0
        }) as (StructureSpawn | StructureExtension | StructureContainer)[]
    return x
}

export class HarvesterBehavior implements EntityBehavior {
    private data: JsonObj
    private state_key: string
    private creep_id: string
    private creep: Creep | null
    private sources: Source[]
    private spawns: EnergyContainers[]

    constructor() {
        this.data = {}
        this.state_key = "state"
        this.sources = []
        this.spawns = []
        this.creep_id = ""
        this.creep = null
    }


    Load(file: ScreepFile, id: string) {
        this.creep_id = id
        this.creep = Game.getObjectById(this.creep_id as Id<Creep>)
        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)

        if (this.creep !== null) {
            if (!this.data[this.state_key]) {
                this.sources = this.creep.room.find(FIND_SOURCES)
            }
        }

        return this.creep != null
    }

    Run() {
        if (this.creep === null) { return }

        this.data[this.state_key] = FlipStateBasedOnEnergyInCreep(this.creep, this.data[this.state_key] as boolean)
        const STORAGE = GetEnergyStorageTargets(this.creep_id)

        if (!this.data[this.state_key]) {
            if (STORAGE.at(-1)?.structureType === STRUCTURE_CONTAINER) {
                const CONTAINER = STORAGE.at(-1)!
                const SOURCE = CONTAINER.pos.findClosestByPath(FIND_SOURCES)
                if (SOURCE == null) { return }

                const CREEP_X = this.creep.pos.x
                const CREEP_Y = this.creep.pos.y
                const CONTAINER_X = CONTAINER.pos.x
                const CONTAINER_Y = CONTAINER.pos.y

                if (CREEP_X !== CONTAINER_X || CREEP_Y !== CONTAINER_Y) {
                    this.creep.moveTo(CONTAINER_X, CONTAINER_Y, { maxRooms: 1 })
                }
                else {
                    this.creep.harvest(SOURCE)
                }

            }
            else {

            }
        }
        else {
            let i = 0
            let target = STORAGE[i]
            while (i < STORAGE.length && target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                target = STORAGE[++i]
            }
            if (target == null) {
                target = STORAGE[0]
            }
            if (this.creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target, { maxRooms: 1 })
            }
        }
    }

    Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
    }

    Unload(file: ScreepFile) {
        BuildingAllocator.RemoveStructureId(STRUCTURE_CONTAINER, this.creep_id)
    }

}
