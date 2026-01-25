import { CreepBehavior, JsonObj } from "Consts";
import { ScreepFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { Timer } from "utils/Timer";
import { SafelyReadFromFile } from "utils/UtilFuncs";

export class RepairBehavior implements CreepBehavior {
    private creep: Creep | null
    private source: Source | null
    private structures: (Structure | null)[]
    private data: JsonObj
    private state_key: string
    private source_key: string
    private target: Structure | null
    private timer: Timer | null

    public constructor() {
        this.structures = []
        this.source = null
        this.data = {}
        this.state_key = "state"
        this.creep = null
        this.source_key = "source"
        this.target = null
        this.timer = null
    }

    public Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)

        if (this.creep) {
            this.source = this.creep.pos.findClosestByPath(FIND_SOURCES)
        }

        this.data[this.state_key] = SafelyReadFromFile(file, this.state_key, false)
        this.data[this.source_key] = SafelyReadFromFile(file, this.source_key, 'null')

        this.target = Game.getObjectById(this.data[this.source_key] as Id<Structure>)

        this.timer = new Timer(id)

        if (this.data[this.source_key] === 'null' || this.timer.IsTimerDone()) {
            this.structures = [
                ...RoomData.GetRoomData().GetOwnedStructureIds(),
                ...RoomData.GetRoomData().GetRoomStructures(STRUCTURE_WALL)
            ]
                .map(id => Game.getObjectById(id as Id<Structure>))
                .filter(s => s != null && s.hits / s.hitsMax < .75)
                .sort((a, b) => {
                    const RAMPART_CRITICAL = (
                        a?.structureType === STRUCTURE_RAMPART
                        && a.structureType !== b?.structureType
                        && Number(a.hits) / Number(a.hitsMax) <= .03
                    )
                    if (RAMPART_CRITICAL) {
                        return -1
                    }
                    else if (Number(a?.hits) < Number(b?.hits)) {
                        return -1
                    }
                    else {
                        return 1
                    }
                })


            const STRUCT_TO_REPAIR = this.structures.at(0)
            if (STRUCT_TO_REPAIR) {
                this.target = STRUCT_TO_REPAIR
                this.data[this.source_key] = this.target.id
            }
            else {
                this.target = null
            }
        }

        return this.creep != null
    }
    public Run() {
        if (this.creep == null) { return }

        const NO_ENERGY = this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
        const FULL_ENERGY = this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0

        if (NO_ENERGY) {
            this.data[this.state_key] = false
        }
        else if (FULL_ENERGY) {
            this.data[this.state_key] = true
        }

        if (!this.data[this.state_key]) {
            if (this.source == null) { return }

            if (this.creep.harvest(this.source) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(this.source, { maxRooms: 1 })
            }
        }
        else {
            let building = this.target

            if (building == null) { return }

            const REPAIR_RESULT = this.creep.repair(building)
            if (REPAIR_RESULT === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(building, { maxRooms: 1 })
            }
            else if (REPAIR_RESULT === OK) {
                this.timer?.StartTimer(15)
            }
        }
    }
    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
        file.WriteToFile(this.source_key, this.data[this.source_key])
    }
}
