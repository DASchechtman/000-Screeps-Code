import { JsonObj } from "Consts"
import { FILE } from "dns"
import { ScreepFile, ScreepMetaFile } from "FileSystem/File"
import { RoomData } from "Rooms/RoomData"
import { Timer } from "utils/Timer"
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs"
import { FlipStateBasedOnEnergyInCreep, GetContainerIdIfThereIsEnoughStoredEnergy, GetEnergy } from "./Utils/CreepUtils"
import { EntityBehavior } from "./BehaviorTypes"

export class UpgraderBehavior implements EntityBehavior {
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
            this.data[this.container_key] = GetContainerIdIfThereIsEnoughStoredEnergy(this.data[this.container_key] as string)
            if (this.data[this.container_key] === 'null') {
                this.data[this.container_key] = "N/A"
            }
        }

        return this.creep != null
    }

    public Run() {
        if (this.creep == null || this.controller == null) { return }

        this.data[this.state_key] = FlipStateBasedOnEnergyInCreep(this.creep, this.data[this.state_key] as boolean)

        if (!this.data[this.state_key]) {
            let container = Game.getObjectById(this.data[this.container_key] as Id<StructureContainer>)
            if (container && container.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                const container_id = GetContainerIdIfThereIsEnoughStoredEnergy(this.data[this.container_key] as string)
                container = Game.getObjectById(container_id as Id<StructureContainer>)
            }
            GetEnergy(this.creep, this.sources[1], container)
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

    Unload(file: ScreepFile) {}

}
