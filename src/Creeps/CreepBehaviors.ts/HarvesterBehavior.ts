import { CreepBehavior } from "Creeps/Creep";
import { JsonObj, ScreepFile } from "FileSystem/File";

export class HarvesterBehavior implements CreepBehavior {
    private data: JsonObj
    private state_key: string
    private creep_id: string
    private creep: Creep | null
    private sources: Source[]
    private spawns: StructureSpawn[]

    constructor(creep_id: string) {
        this.data = {}
        this.state_key = "state"
        this.creep_id = creep_id
        this.creep = Game.getObjectById(this.creep_id as Id<Creep>)
        this.sources = []
        this.spawns = []

        if (this.creep !== null) {
            this.sources = this.creep.room.find(FIND_SOURCES)
            this.spawns = this.creep.room.find(FIND_MY_SPAWNS)
        }
    }


    Load(file: ScreepFile) {
        try {
            this.data[this.state_key] = file.ReadFromFile(this.state_key)
        } catch {
            this.data[this.state_key] = false
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
                this.creep.moveTo(this.sources[0])
            }
        }
        else {
            if (this.creep.transfer(this.spawns[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(this.spawns[0])
            }
        }
    }

    Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
    };

}
