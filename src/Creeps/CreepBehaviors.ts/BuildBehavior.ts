import { ScreepFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { REPAIR_TYPE } from "./BehaviorTypes";
import { BEHAVIOR_KEY, CreepBehavior, JsonObj, ORIG_BEHAVIOR_KEY } from "Consts";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";

export class BuildBehavior implements CreepBehavior {
    private creep: Creep | null
    private construction_sites: ConstructionSite[]
    private sources: Source | null
    private data: JsonObj
    private state_key: string
    private site_key: string
    private site: ConstructionSite | null

    public constructor() {
        this.creep = null
        this.construction_sites = []
        this.sources = null
        this.data = {}
        this.state_key = "state"
        this.site_key = "construction site"
        this.site = null
    }

    public Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)

        if (this.creep) {
            this.sources = this.creep.pos.findClosestByPath(FIND_SOURCES)
        }

        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        this.data[this.site_key] = SafeReadFromFileWithOverwrite(file, this.site_key, 'null')

        this.site = Game.getObjectById(this.data[this.site_key] as Id<ConstructionSite>)

        let i = 0
        const ALL_SITES = RoomData.GetRoomData().GetConstructionSites()

        while (i < ALL_SITES.length && this.site === null) {
            this.data[this.site_key] = ALL_SITES[i]
            this.site = Game.getObjectById(this.data[this.site_key] as Id<ConstructionSite>)
            i++
        }

        return this.creep != null
    }

    public Run() {
        if (this.creep == null) { return }
        const NO_ENERGY = this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
        const FULL_ENERGY = this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0

        if (NO_ENERGY) { this.data[this.state_key] = false }
        else if (FULL_ENERGY) { this.data[this.state_key] = true }

        if (!this.data[this.state_key]) {
            if (this.sources == null) { return }
            if (this.creep.harvest(this.sources) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(this.sources, { maxRooms: 1 })
            }
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


        if (this.site === null) {
            file.WriteToFile(BEHAVIOR_KEY, REPAIR_TYPE)
        }
    }
}
