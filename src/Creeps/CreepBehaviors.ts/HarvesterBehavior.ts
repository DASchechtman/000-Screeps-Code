import { CreepBehavior, JsonObj } from "Consts";
import { ScreepFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";

type EnergyContainers = StructureSpawn | StructureExtension | StructureContainer

export class HarvesterBehavior implements CreepBehavior {
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

        console.log(`Harvester State: ${this.data[this.state_key]}, id: ${id}`)

        if (this.creep !== null) {
            if (!this.data[this.state_key]) {
                this.sources = this.creep.room.find(FIND_SOURCES)
            }
            else {
                let x = [
                    ...RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]),
                    ...RoomData.GetRoomData().GetRoomStructures(STRUCTURE_CONTAINER)
                ]
                    .map(id => Game.getObjectById(id as Id<Structure>))
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

                this.spawns = x as EnergyContainers[]
            }
        }

        return this.creep != null
    }

    Run() {
        if (this.creep === null) { return }

        const NO_ENERGY = this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
        const ENERGY_FULL = this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0

        if (NO_ENERGY) {
            this.data[this.state_key] = false
        }
        else if (ENERGY_FULL) {
            this.data[this.state_key] = true
        }

        if (!this.data[this.state_key]) {
            if (this.creep.harvest(this.sources[0]) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(this.sources[0], { maxRooms: 1 })
            }
        }
        else {
            let i = 0
            let target = this.spawns[i]
            while (i < this.spawns.length && target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                target = this.spawns[++i]
            }
            if (target == null) {
                target = this.spawns[0]
            }
            if (this.creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target, { maxRooms: 1 })
            }
        }
    }

    Cleanup(file: ScreepFile) {
        console.log('saving harvester to file')
        file.WriteToFile(this.state_key, this.data[this.state_key])
    };

}
