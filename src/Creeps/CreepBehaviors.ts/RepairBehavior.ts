import { JsonObj } from "Consts";
import { CreepBehavior } from "Creeps/Creep";
import { ScreepFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";

export class RepairBehavior implements CreepBehavior {
    private creep: Creep | null
    private source: Source | null
    private structures: (Structure | null)[]
    private data: JsonObj
    private state_key: string

    public constructor(id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        this.structures = [
            ...RoomData.GetRoomData().GetOwnedStructureIds(),
            ...RoomData.GetRoomData().GetRoomStructures(STRUCTURE_WALL)
        ].map(id => Game.getObjectById(id as Id<Structure>))
        .filter(s => s?.hits && s?.hitsMax && s.hits / s.hitsMax < .75)
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
        this.source = null
        this.data = {}
        this.state_key = "state"

        if (this.creep) {
            this.source = this.creep.pos.findClosestByPath(FIND_SOURCES)
        }
    }

    public Load(file: ScreepFile) {
        try {
            this.data[this.state_key] = file.ReadFromFile(this.state_key)
        }
        catch {
            file.WriteToFile(this.state_key, false)
            this.data[this.state_key] = false
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
            const BUILDING = this.structures[0]

            if (BUILDING == null) { return}

            if (this.creep.repair(BUILDING) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(BUILDING, { maxRooms: 1 })
            }
        }
    }
    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
     }
}
