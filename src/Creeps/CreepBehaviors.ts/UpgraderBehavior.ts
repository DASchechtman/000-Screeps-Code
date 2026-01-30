import { CreepBehavior, JsonObj } from "Consts"
import { FILE } from "dns"
import { ScreepFile, ScreepMetaFile } from "FileSystem/File"
import { RoomData } from "Rooms/RoomData"
import { Timer } from "utils/Timer"
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs"

export class UpgraderBehavior implements CreepBehavior {
    private data: JsonObj
    private state_key: string
    private container_key: string
    private creep_id: string
    private creep: Creep | null
    private sources: Source[]
    private containers: StructureContainer[]
    private controller: StructureController | undefined

    constructor() {
        this.state_key = "state key"
        this.container_key = "from container?"
        this.data = {}
        this.sources = []
        this.controller = undefined
        this.creep_id = ""
        this.creep = null
        this.containers = []
    }

    public Load(file: ScreepFile, id: string) {
        this.creep_id = id
        this.creep = Game.getObjectById(this.creep_id as Id<Creep>)

        if (this.creep != null) {
            this.sources = this.creep.room.find(FIND_SOURCES)
            this.controller = this.creep.room.controller
        }

        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        this.data[this.container_key] = SafeReadFromFileWithOverwrite(file, this.container_key, 'null')

        const TIMER = new Timer(id)
        TIMER.StartTimer(15)

        if (this.data[this.container_key] === 'null' || TIMER.IsTimerDone()) {

            const ALL_CONTAINERS = RoomData.GetRoomData().GetRoomStructures(STRUCTURE_CONTAINER)
                .map(id => Game.getObjectById(id))
                .filter(s => s !== null) as StructureContainer[]

            const STORED_ENERGY = ALL_CONTAINERS.reduce((prev, cur) => prev + cur.store.getUsedCapacity(RESOURCE_ENERGY), 0)

            if (STORED_ENERGY > 0 && STORED_ENERGY >= 2000 * ALL_CONTAINERS.length * .9) {
                ALL_CONTAINERS.sort((a, b) => {
                    return a.store.getUsedCapacity(RESOURCE_ENERGY) - b.store.getUsedCapacity(RESOURCE_ENERGY)
                })

                this.data[this.container_key] = ALL_CONTAINERS.at(-1)!.id

            }
            else if (STORED_ENERGY <= 2000 * ALL_CONTAINERS.length * .1) {
                this.data[this.container_key] = 'N/A'
            }

            if (this.data[this.container_key] === 'null') {
                this.data[this.container_key] = "N/A"
            }
        }

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
            const CONTAINER = Game.getObjectById(this.data[this.container_key] as Id<StructureContainer>)
            if (CONTAINER && this.creep.withdraw(CONTAINER, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(CONTAINER)
            }
            else if (this.creep.harvest(this.sources[1]) === ERR_NOT_IN_RANGE) {
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
        file.WriteToFile(this.container_key, this.data[this.container_key])
    }

}
