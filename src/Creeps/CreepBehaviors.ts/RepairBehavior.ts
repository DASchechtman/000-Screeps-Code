import { JsonObj } from "Consts";
import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { Timer } from "utils/Timer";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { CreateConstructionSite, FlipStateBasedOnEnergyInCreep, GetContainerIdIfThereIsEnoughStoredEnergy, GetDamagedStruct, GetEnergy, SortStructs } from "./Utils/CreepUtils";
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
    private repair_struct_id_key: string

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
        this.repair_struct_id_key = "repair struct id"
    }

    public Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        const HAS_CREEP = this.creep != null

        if (this.creep) {
            this.source = this.creep.pos.findClosestByPath(FIND_SOURCES)
            CreateConstructionSite(this.creep)
        }

        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file.GetFilePath(), this.state_key, false)
        this.data[this.source_key] = SafeReadFromFileWithOverwrite(file.GetFilePath(), this.source_key, 'null')
        this.data[this.container_key] = SafeReadFromFileWithOverwrite(file.GetFilePath(), this.container_key, 'null')
        this.data[this.repair_struct_id_key] = SafeReadFromFileWithOverwrite(file.GetFilePath(), this.repair_struct_id_key, 'null')

        const TIMER = new Timer(`repair_behavior_${id}`)
        this.timer = TIMER

        if (this.data[this.state_key] && (TIMER.IsTimerDone() || this.data[this.repair_struct_id_key] === 'null')) {
            const DAMAGED_STRUCTS = GetDamagedStruct()
            this.data[this.repair_struct_id_key] = DAMAGED_STRUCTS ? DAMAGED_STRUCTS.id : 'null'
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
            this.data[this.repair_struct_id_key] = 'null'
        }
        else {
            let building = Game.getObjectById(this.data[this.repair_struct_id_key] as Id<Structure>)

            if (building == null) { return }

            const REPAIR_RESULT = this.creep.repair(building)
            if (REPAIR_RESULT === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(building, { maxRooms: 1 })
            }
            else if (REPAIR_RESULT === OK) {
                this.timer?.StartTimer(10)
            }
        }
    }
    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
        file.WriteToFile(this.source_key, this.data[this.source_key])
        file.WriteToFile(this.container_key, this.data[this.container_key])
        file.WriteToFile(this.repair_struct_id_key, this.data[this.repair_struct_id_key])
    }
    Unload(file: ScreepFile) {}

    RecieveOrder(data: JsonObj) { return () => ({}) }
}
