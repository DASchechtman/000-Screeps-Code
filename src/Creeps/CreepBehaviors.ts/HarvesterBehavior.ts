import { JsonObj } from "Consts";
import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { FlipStateBasedOnEnergyInCreep } from "./Utils/CreepUtils";
import { EntityBehavior } from "./BehaviorTypes";
import { BuildingAllocator } from "utils/BuildingAllocator";

type EnergyContainer = StructureSpawn | StructureExtension | StructureContainer | null

function GetEnergyStorageTargets(id: string) {
    const CONTAINER_ID = BuildingAllocator.GetStructureId(STRUCTURE_CONTAINER, id)

    if (CONTAINER_ID == null) { return [] }


    let x = [
        ...RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]),
        CONTAINER_ID
    ]
        .map(id => Game.getObjectById(id))
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
        })


    return x
}

export class HarvesterBehavior implements EntityBehavior {
    private data: JsonObj
    private state_key: string
    private creep_id: string
    private creep: Creep | null
    private sources: Source[]
    private spawns: EnergyContainer[]

    constructor() {
        this.data = {}
        this.state_key = "state"
        this.sources = []
        this.spawns = []
        this.creep_id = ""
        this.creep = null
    }

    private DefaultHarvestBehavior(creep: Creep, storage: EnergyContainer[]) {
        if (!this.data[this.state_key]) {
            let res = creep.harvest(this.sources[0])

            if (res === ERR_NOT_ENOUGH_ENERGY) {
                const NEXT_SOURCE = this.sources.at(1)
                if (NEXT_SOURCE == null) { return }

                res = creep.harvest(NEXT_SOURCE)
                if (res === ERR_NOT_IN_RANGE) {
                    creep.moveTo(NEXT_SOURCE)
                }
            }
            else if (res === ERR_NOT_IN_RANGE) {
                creep.moveTo(this.sources[0])
            }
        }
        else {
            let i = 0
            let target: EnergyContainer | undefined = storage.at(i)
            while (i < storage.length && target?.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                target = storage.at(++i)
            }
            if (target == null) {
                let next = storage[0]
                if (next != null) { target = next }
                else { return }
            }
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { maxRooms: 1 })
            }
        }
    }

    private ContainerHarvestBehavior(creep: Creep, storage: EnergyContainer[]) {
        const CONTAINER = storage.at(-1)!
        if (!this.data[this.state_key]) {

            const SOURCE = CONTAINER.pos.findClosestByPath(FIND_SOURCES)
            if (SOURCE == null) { return }

            const CREEP_X = creep.pos.x
            const CREEP_Y = creep.pos.y
            const CONTAINER_X = CONTAINER.pos.x
            const CONTAINER_Y = CONTAINER.pos.y

            if (CREEP_X !== CONTAINER_X || CREEP_Y !== CONTAINER_Y) {
                creep.moveTo(CONTAINER_X, CONTAINER_Y, { maxRooms: 1 })
            }
            else {
                creep.harvest(SOURCE)
            }
        }
        else {
            creep.transfer(CONTAINER, RESOURCE_ENERGY)
        }
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

        if (STORAGE.at(-1)?.structureType === STRUCTURE_CONTAINER) {
            this.ContainerHarvestBehavior(this.creep, STORAGE)
        }
        else {
            this.DefaultHarvestBehavior(this.creep, STORAGE)
        }
    }

    Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
    }

    Unload(file: ScreepFile) {
        BuildingAllocator.RemoveStructureId(STRUCTURE_CONTAINER, this.creep_id)
    }

}
