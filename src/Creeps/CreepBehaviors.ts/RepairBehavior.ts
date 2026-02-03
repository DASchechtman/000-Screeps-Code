import { JsonObj } from "Consts";
import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { Timer } from "utils/Timer";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { FlipStateBasedOnEnergyInCreep, GetContainerIdIfThereIsEnoughStoredEnergy, GetDamagedStruct, GetEnergy, SortStructs } from "./Utils/CreepUtils";
import { EntityBehavior } from "./BehaviorTypes";

export class RepairBehavior implements EntityBehavior {
    private creep: Creep | null
    private source: Source | null
    private structures: (Structure | null)[]
    private data: JsonObj
    private state_key: string
    private source_key: string
    private target: Structure | null
    private timer: Timer | null
    private container_key: string

    public constructor() {
        this.structures = []
        this.source = null
        this.data = {}
        this.state_key = "state"
        this.creep = null
        this.source_key = "source"
        this.target = null
        this.timer = null
        this.container_key = "container from?"
    }

    public Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        const HAS_CREEP = this.creep != null

        if (this.creep) {
            this.source = this.creep.pos.findClosestByPath(FIND_SOURCES)
        }

        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        this.data[this.source_key] = SafeReadFromFileWithOverwrite(file, this.source_key, 'null')
        this.data[this.container_key] = SafeReadFromFileWithOverwrite(file, this.container_key, 'null')

        this.target = Game.getObjectById(this.data[this.source_key] as Id<Structure>)

        this.timer = new Timer(id)

        if (this.data[this.source_key] === 'null' || this.timer.IsTimerDone() || this.target == null) {
            const STRUCT_TO_REPAIR = GetDamagedStruct()
            if (STRUCT_TO_REPAIR) {
                this.target = STRUCT_TO_REPAIR
                this.data[this.source_key] = this.target.id
            }
            else {
                this.target = null
            }
        }

        const TIMER_2 = new Timer(`${id} - 2`)
        TIMER_2.StartTimer(15)

        if (this.data[this.container_key] === 'null' || TIMER_2.IsTimerDone()) {
            if (!HAS_CREEP) { return false }
            this.data[this.container_key] = GetContainerIdIfThereIsEnoughStoredEnergy(this.creep!)
            if (this.data[this.container_key] === 'null') { this.data[this.container_key] = "N/A" }
        }

        return HAS_CREEP
    }
    public Run() {
        if (this.creep == null) { return }

        this.data[this.state_key] = FlipStateBasedOnEnergyInCreep(this.creep, this.data[this.state_key] as boolean)

        if (!this.data[this.state_key]) {
            if (this.source == null) { return }
            let container = Game.getObjectById(this.data[this.container_key] as Id<StructureContainer>)
            GetEnergy(this.creep, this.source, null, container)
        }
        else {
            let building = this.target

            if (building == null) { return }

            const REPAIR_RESULT = this.creep.repair(building)
            if (REPAIR_RESULT === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(building, { maxRooms: 1 })
            }
            else if (REPAIR_RESULT === OK) {
                this.timer?.StartTimer(5)
            }
        }
    }
    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
        file.WriteToFile(this.source_key, this.data[this.source_key])
        file.WriteToFile(this.container_key, this.data[this.container_key])
    }
    Unload(file: ScreepFile) {}
}
