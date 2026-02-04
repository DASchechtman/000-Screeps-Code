import { ScreepFile } from "FileSystem/File";
import { EntityBehavior, EntityState, EntityStateManager } from "./BehaviorTypes";
import { RoomData } from "Rooms/RoomData";
import { JsonObj } from "Consts";
import { SafeReadFromFile, SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { Timer } from "utils/Timer";
import { GetDamagedStruct, SortStructs } from "./Utils/CreepUtils";

const REPAIR_STATE = 0
const ATTACK_STATE = 1

class RepairState implements EntityState {
    private tower_id: Id<StructureTower>
    private tower: StructureTower | null
    constructor(tower_id: Id<StructureTower>) {
        this.tower_id = tower_id
        this.tower = null
    }

    private GetTower(): StructureTower | null {
        this.tower = Game.getObjectById(this.tower_id)
        return this.tower
    }

    RunState() {
        if (this.GetTower() == null) { return false }
        const TOWER = this.tower!

        const DAMAGED_STRUCT = GetDamagedStruct()
        if (DAMAGED_STRUCT) {
            TOWER.repair(DAMAGED_STRUCT)
        }

        return true
    }

    GetNextState() {
        const TOWER = this.tower!

        const CUR_ENERGY = TOWER.store.getUsedCapacity(RESOURCE_ENERGY)
        if (CUR_ENERGY < 500) {
            return new LowPowerRepairState(this.tower_id)
        }

        return this
    }
}

class LowPowerRepairState implements EntityState {
    private tower_id: Id<StructureTower>
    private tower: StructureTower | null
    constructor(tower: Id<StructureTower>) {
        this.tower_id = tower
        this.tower = null
    }

    private GetTower(): StructureTower | null {
        this.tower = Game.getObjectById(this.tower_id)
        return this.tower
    }

    RunState() {
        if (this.GetTower() == null) { return false }
        const TOWER = this.tower!

        const DAMAGED_STRUCT = GetDamagedStruct()
        const TIMER = new Timer(this.tower_id)
        TIMER.StartTimer(3)

        if (DAMAGED_STRUCT && TIMER.IsTimerDone()) {
            TOWER.repair(DAMAGED_STRUCT)
        }

        return true
    }

    GetNextState() {
        const TOWER = this.tower!

        const CUR_ENERGY = TOWER.store.getUsedCapacity(RESOURCE_ENERGY)
        if (CUR_ENERGY >= 500) {
            return new RepairState(this.tower_id)
        }

        return this
    }
}

export class TowerBehavior implements EntityBehavior {
    private static tower_ids: string[] = []
    private static creep_to_tower: Map<string, string> = new Map()
    private static index: number = 0
    private static state_manager: EntityStateManager | null = null

    private static GetStateManager(tower: Id<StructureTower>): EntityStateManager {
        if (this.state_manager === null) {
            this.state_manager = new EntityStateManager(new RepairState(tower))
        }

        return this.state_manager
    }

    public static GetTowerId(id: string): string | undefined {
        if (this.creep_to_tower.has(id)) {
            return this.creep_to_tower.get(id)!
        }
        const ID = this.tower_ids[this.index]
        this.index++
        this.creep_to_tower.set(id, ID)
        return ID
    }

    public static RemoveTowerId(id: string) {
        if (this.creep_to_tower.has(id)) {
            const ID = this.creep_to_tower.get(id)!
            const INDEX = this.tower_ids.indexOf(ID)

            if (INDEX >= 0) {
                this.tower_ids.splice(INDEX, 1)
            }

            this.creep_to_tower.delete(id)
        }
    }

    private tower: StructureTower | null
    private enemies: Id<Creep>[]
    private damaged_struct: string
    private data: JsonObj
    private state_key: string
    private damaged_struct_key: string
    private id: string
    private state_manager: EntityStateManager | null | void | undefined
    private file: ScreepFile | null

    constructor() {
        this.tower = null
        this.enemies = []
        this.damaged_struct = ""
        this.id = ""
        this.data = {}
        this.state_key = "state"
        this.damaged_struct_key = "damaged struct"
        this.state_manager = null
        this.file = null
    }

    Load(file: ScreepFile, id: string) {
        this.tower = Game.getObjectById(id as Id<StructureTower>)
        this.enemies = RoomData.GetRoomData().GetAllEnemyCreepIds()
        this.id = id
        this.file = file
        if (this.tower == null) { return false }

        this.state_manager = TowerBehavior.GetStateManager(id as Id<StructureTower>)

        return this.tower !== null
    }

    Run() {
        if (this.state_manager?.RunState(this.file!)) {
            this.state_manager?.GetNextState()
        }
    }

    Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
        file.WriteToFile(this.damaged_struct_key, this.data[this.damaged_struct_key])
    }

    Unload(file: ScreepFile) {
        const IDS_TO_REMOVE = new Array<string>()
        const KEYS_TO_REMOVE = new Array<string>()
        for (let [key, val] of TowerBehavior.creep_to_tower) {
            if (val === this.id) {
                IDS_TO_REMOVE.push(val)
                KEYS_TO_REMOVE.push(key)
            }
        }

        for (let id of IDS_TO_REMOVE) {
            const INDEX = TowerBehavior.tower_ids.indexOf(id)
            if (INDEX >= 0) { TowerBehavior.tower_ids.splice(INDEX, 1) }
        }

        for (let id of KEYS_TO_REMOVE) {
            TowerBehavior.creep_to_tower.delete(id)
        }
    }

}
