import { ScreepFile } from "FileSystem/File";
import { EntityBehavior } from "./BehaviorTypes";
import { RoomData } from "Rooms/RoomData";
import { JsonObj } from "Consts";
import { SafeReadFromFile, SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { Timer } from "utils/Timer";
import { SortStructs } from "./Utils/CreepUtils";

const REPAIR_STATE = 0
const ATTACK_STATE = 1

export class TowerBehavior implements EntityBehavior {
    private static tower_ids: string[] = []
    private static index: number = 0

    public static GetTowerId(): string | undefined {
        if (this.index >= this.tower_ids.length) { return undefined }
        const ID = this.tower_ids[this.index]
        this.index++
        return ID
    }

    private tower: StructureTower | null
    private enemies: string[]
    private damaged_struct: string
    private data: JsonObj
    private state_key: string
    private damaged_struct_key: string
    private id: string

    constructor() {
        this.tower = null
        this.enemies = []
        this.damaged_struct = ""
        this.id = ""
        this.data = {}
        this.state_key = "state"
        this.damaged_struct_key = "damaged struct"
    }

    Load(file: ScreepFile, id: string) {
        this.tower = Game.getObjectById(id as Id<StructureTower>)
        this.enemies = RoomData.GetRoomData().GetAllEnemyCreepIds()
        this.id = id

        if (!TowerBehavior.tower_ids.includes(id)) {
            TowerBehavior.tower_ids[TowerBehavior.index] = id

        }

        if (this.enemies.length === 0) {
            this.data[this.state_key] = REPAIR_STATE
        }
        else {
            this.data[this.state_key] = ATTACK_STATE
        }

        this.data[this.damaged_struct_key] = SafeReadFromFileWithOverwrite(file, this.damaged_struct_key, 'null')
        const TIMER = new Timer(id)
        TIMER.StartTimer(15)

        if (this.data[this.damaged_struct_key] === 'null' || TIMER.IsTimerDone()) {
            const STRUCTURES = [
                ...RoomData.GetRoomData().GetOwnedStructureIds(),
                ...RoomData.GetRoomData().GetRoomStructures([STRUCTURE_WALL, STRUCTURE_CONTAINER])
            ]
                .map(id => Game.getObjectById(id as Id<Structure>))
                .filter(s => s != null && s.hits / s.hitsMax < .75)
                .sort(SortStructs)


            const STRUCT_TO_REPAIR = STRUCTURES.at(0)
            if (STRUCT_TO_REPAIR) {
                this.data[this.damaged_struct_key] = STRUCT_TO_REPAIR.id
            }
            else {
                this.data[this.damaged_struct_key] = 'N/A'
            }
        }

        return this.tower !== null
    }

    Run() {
        if (this.tower == null) { return }

        switch (this.data[this.state_key]) {
            case REPAIR_STATE: {
                const DAMAGED_STRUCT = Game.getObjectById(this.data[this.damaged_struct_key] as Id<Structure>)
                if (DAMAGED_STRUCT == null) { return }
                const TIMER = new Timer(`${this.tower.id} - 2`)
                TIMER.StartTimer(3)
                if (TIMER.IsTimerDone()) {
                    this.tower.repair(DAMAGED_STRUCT)
                }
                break
            }

            case ATTACK_STATE: {
                break
            }
        }

    }

    Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
        file.WriteToFile(this.damaged_struct, this.data[this.damaged_struct])
    }

    Unload(file: ScreepFile) {
        const INDEX = TowerBehavior.tower_ids.indexOf(this.id)
        if (INDEX >= 0) {
            TowerBehavior.tower_ids.splice(INDEX, 1)
            TowerBehavior.index--
        }
    }

}
