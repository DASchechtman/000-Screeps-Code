import { CreepBehavior, JsonObj } from "Consts"
import { ScreepFile } from "FileSystem/File"
import { SafelyReadFromFile } from "utils/UtilFuncs"

export class UpgraderBehavior implements CreepBehavior {
    private data: JsonObj
    private state_key: string
    private creep_id: string
    private creep: Creep | null
    private sources: Source[]
    private controller: StructureController | undefined

    constructor() {
        this.state_key = "state key"
        this.data = {}
        this.sources = []
        this.controller = undefined
        this.creep_id = ""
        this.creep = null
    }

    public Load(file: ScreepFile, id: string) {
        this.creep_id = id
        this.creep = Game.getObjectById(this.creep_id as Id<Creep>)

        if (this.creep != null) {
            this.sources = this.creep.room.find(FIND_SOURCES)
            this.controller = this.creep.room.controller
        }

        this.data[this.state_key] = SafelyReadFromFile(file, this.state_key, false)
        return this.creep != null
    }

    public Run() {
        if (this.creep == null || this.controller == null) { return }

        const NO_ENERGY = this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
        const ENERGY_FULL = this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0

        if (NO_ENERGY) {
            this.data[this.state_key] = false
        }
        else if (ENERGY_FULL) {
            this.data[this.state_key] = true
        }

        if (!this.data[this.state_key]) {
            if (this.creep.harvest(this.sources[1]) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(this.sources[1], { maxRooms: 1 })
            }
        }
        else {
            if (this.creep.upgradeController(this.controller) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(this.controller, { maxRooms: 1 })
            }
        }
    }

    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
    }

}
