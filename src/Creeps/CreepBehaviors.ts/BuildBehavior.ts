import { CreepBehavior } from "Creeps/Creep";
import { ScreepFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { REPAIR_TYPE } from "./BehaviorTypes";
import { BEHAVIOR_KEY, JsonObj, ORIG_BEHAVIOR_KEY } from "Consts";

export class BuildBehavior implements CreepBehavior {
    private creep: Creep | null
    private construction_sites: (ConstructionSite | null)[]
    private sources: Source | null
    private data: JsonObj
    private state_key: string

    public constructor(id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        this.construction_sites = RoomData.GetRoomData().GetConstructionSites().map(csid => Game.getObjectById(csid as Id<ConstructionSite>))
        this.sources = null
        this.data = {}
        this.state_key = "state"

        if (this.creep) {
            this.sources = this.creep.pos.findClosestByPath(FIND_SOURCES)
        }
    }

    public Load(file: ScreepFile) {
        try {
            this.data[this.state_key] = file.ReadFromFile(this.state_key)
        } catch {
            file.WriteToFile(this.state_key, false)
            this.data[this.state_key] = false
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
            let i = 0
            let construct = this.construction_sites[i]

            while (i < this.construction_sites.length && !construct) {
                construct = this.construction_sites[++i]
            }

            if (construct == null) { return }

            if (this.creep.build(construct) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(construct, { maxRooms: 1 })
            }
        }
    }

    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
        const CUR_BEHAVIOR = file.ReadFromFile(BEHAVIOR_KEY)
        const INIT_BEHAVIOR = file.ReadFromFile(ORIG_BEHAVIOR_KEY)

        if (this.construction_sites.length === 0) {
            file.WriteToFile(BEHAVIOR_KEY, REPAIR_TYPE)
        }
        else if (CUR_BEHAVIOR !== INIT_BEHAVIOR) {
            file.WriteToFile(BEHAVIOR_KEY, INIT_BEHAVIOR)
            file.WriteToFile(ORIG_BEHAVIOR_KEY, INIT_BEHAVIOR)
        }

    }
}
