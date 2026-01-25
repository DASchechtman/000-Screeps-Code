import { CreepBehavior, JsonObj } from "Consts";
import {  ScreepFile } from "FileSystem/File";
import { SafelyReadFromFile } from "utils/UtilFuncs";

export class HarvesterBehavior implements CreepBehavior {
    private data: JsonObj
    private state_key: string
    private creep_id: string
    private creep: Creep | null
    private sources: Source[]
    private spawns: (StructureSpawn | StructureExtension)[]

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

        if (this.creep !== null) {
            this.sources = this.creep.room.find(FIND_SOURCES)
            let x = [
                ...this.creep.room.find(FIND_MY_SPAWNS),
                ...this.creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION})
            ]
            this.spawns = x as (StructureSpawn | StructureExtension)[]
        }

        this.data[this.state_key] = SafelyReadFromFile(file, this.state_key, false)
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
            while(i < this.spawns.length && target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
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
        file.WriteToFile(this.state_key, this.data[this.state_key])
    };

}
