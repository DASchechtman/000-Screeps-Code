import { CreepBehavior, JsonObj } from "Consts";
import { ScreepFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";
import { Timer } from "utils/Timer";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";

export class RepairBehavior implements CreepBehavior {
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

        if (this.creep) {
            this.source = this.creep.pos.findClosestByPath(FIND_SOURCES)
        }

        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        this.data[this.source_key] = SafeReadFromFileWithOverwrite(file, this.source_key, 'null')
        this.data[this.container_key] = SafeReadFromFileWithOverwrite(file, this.container_key, 'null')

        this.target = Game.getObjectById(this.data[this.source_key] as Id<Structure>)

        this.timer = new Timer(id)

        if (this.data[this.source_key] === 'null' || this.timer.IsTimerDone()) {
            this.structures = [
                ...RoomData.GetRoomData().GetOwnedStructureIds(),
                ...RoomData.GetRoomData().GetRoomStructures([STRUCTURE_WALL, STRUCTURE_CONTAINER])
            ]
                .map(id => Game.getObjectById(id as Id<Structure>))
                .filter(s => s != null && s.hits / s.hitsMax < .75)
                .sort((a, b) => {
                    const DECAYING_STRUCT_TYPES: StructureConstant[] = [STRUCTURE_RAMPART, STRUCTURE_CONTAINER]
                    if (a == null || b == null) { return 0 }

                    if (DECAYING_STRUCT_TYPES.includes(a.structureType) && !DECAYING_STRUCT_TYPES.includes(b.structureType) && a.hits / b.hits <= .05) {
                        return -1
                    }
                    else if (DECAYING_STRUCT_TYPES.includes(a.structureType) && DECAYING_STRUCT_TYPES.includes(b.structureType)) {
                        if (a.structureType === STRUCTURE_RAMPART && a.hits / b.hits <= .03) {
                            return -1
                        }
                        else if (a.structureType === STRUCTURE_CONTAINER && a.hits / b.hits <= .4) {
                            return -1
                        }

                        return (a.hits / a.hitsMax) - (b.hits / b.hitsMax)
                    }

                    return (a.hits / a.hitsMax) - (b.hits / b.hitsMax)
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

        const TIMER_2 = new Timer(`${id} - 2`)
        TIMER_2.StartTimer(15)

        if (this.data[this.container_key] === 'null' || TIMER_2.IsTimerDone()) {

            const ALL_CONTAINERS = RoomData.GetRoomData().GetRoomStructures(STRUCTURE_CONTAINER)
                .map(id => Game.getObjectById(id))
                .filter(c => c !== null) as StructureContainer[]

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

            if (this.data[this.container_key] === 'null') { this.data[this.container_key] = "N/A" }
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

            const CONTAINER = Game.getObjectById(this.data[this.container_key] as Id<StructureContainer>)

            if (CONTAINER && this.creep.withdraw(CONTAINER, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(CONTAINER)
            }
            else if (this.creep.harvest(this.source) === ERR_NOT_IN_RANGE) {
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
                this.timer?.StartTimer(5)
            }
        }
    }
    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
        file.WriteToFile(this.source_key, this.data[this.source_key])
        file.WriteToFile(this.container_key, this.data[this.container_key])
    }
}
