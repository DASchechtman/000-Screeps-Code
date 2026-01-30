import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { REPAIR_TYPE } from "./BehaviorTypes";
import { BEHAVIOR_KEY, CreepBehavior, JsonObj, ORIG_BEHAVIOR_KEY } from "Consts";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { Timer } from "utils/Timer";
import { FlipStateBasedOnEnergyInCreep, GetContainerIdIfThereIsEnoughStoredEnergy, GetEnergy } from "./Utils/CreepUtils";

export class BuildBehavior implements CreepBehavior {
    private creep: Creep | null
    private construction_sites: ConstructionSite[]
    private sources: Source | null
    private data: JsonObj
    private state_key: string
    private site_key: string
    private site: ConstructionSite | null
    private container_key: string
    private containers: StructureContainer[]
    private timer: Timer | null

    public constructor() {
        this.creep = null
        this.construction_sites = []
        this.sources = null
        this.data = {}
        this.state_key = "state"
        this.site_key = "construction site"
        this.site = null
        this.container_key = "from container?"
        this.containers = []
        this.timer = null
    }

    public Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)

        if (this.creep) {
            this.sources = this.creep.pos.findClosestByPath(FIND_SOURCES)
        }

        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        this.data[this.container_key] = SafeReadFromFileWithOverwrite(file, this.container_key, 'null')
        this.data[this.site_key] = SafeReadFromFileWithOverwrite(file, this.site_key, 'null')

        this.site = Game.getObjectById(this.data[this.site_key] as Id<ConstructionSite>)

        let i = 0
        const ALL_SITES = RoomData.GetRoomData().GetConstructionSites()

        while (i < ALL_SITES.length && this.site === null) {
            this.data[this.site_key] = ALL_SITES[i]
            this.site = Game.getObjectById(this.data[this.site_key] as Id<ConstructionSite>)
            i++
        }

        this.timer = new Timer(id)
        this.timer.StartTimer(15)

        if (this.data[this.container_key] === 'null' || this.timer.IsTimerDone()) {
            this.data[this.container_key] = GetContainerIdIfThereIsEnoughStoredEnergy(this.data[this.container_key] as string)

            if (this.data[this.container_key] === 'null') {
                this.data[this.container_key] = 'N/A'
            }
        }

        return this.creep != null
    }

    public Run() {
        if (this.creep == null) { return }

        this.data[this.state_key] = FlipStateBasedOnEnergyInCreep(this.creep, this.data[this.state_key] as boolean)

        if (!this.data[this.state_key]) {
            if (this.sources == null) { return }
            const container = Game.getObjectById(this.data[this.container_key] as Id<StructureContainer>)
            GetEnergy(this.creep, this.sources, container)
        }
        else {
            let construct = this.site

            if (construct == null) { return }

            if (this.creep.build(construct) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(construct, { maxRooms: 1 })
            }
        }
    }

    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
        file.WriteToFile(this.site_key, this.data[this.site_key])
        file.WriteToFile(this.container_key, this.data[this.container_key])

        if (this.site === null) {
            file.WriteToFile(BEHAVIOR_KEY, REPAIR_TYPE)
        }
    }
}
