import { JsonObj } from "Consts";
import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { EntityBehavior } from "./BehaviorTypes";


export class AttackBehavior implements EntityBehavior {
    private creep: Creep | null
    private enemy_creep_ids: string[]
    private ally_creeps: string[]
    private data: JsonObj
    private state_key: string

    constructor() {
        try {
            this.enemy_creep_ids = RoomData.GetRoomData().GetAllEnemyCreepIds()
            this.ally_creeps = RoomData.GetRoomData().GetCreepIds()
        } catch {
            this.enemy_creep_ids = []
            this.ally_creeps = []
        }

        this.data = {}
        this.state_key = "state"
        this.creep = null
    }

    public Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        return this.creep != null
    }

    public Run() {
        if (this.creep == null) { return }

        const INJURED_CREEP_COUNT = this.ally_creeps
            .map(c => Game.getObjectById(c as Id<Creep>))
            .filter(c => c != null && c.hits < c.hitsMax).length

        if (INJURED_CREEP_COUNT > 0) {
            this.data[this.state_key] = true
        }
        else {
            this.data[this.state_key] = false
        }

        if (this.enemy_creep_ids.length > 0 && this.data[this.state_key]) {
            const ENEMY = Game.getObjectById(this.enemy_creep_ids[0] as Id<Creep>)
            if (!ENEMY) { return }

            if (this.creep.attack(ENEMY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(ENEMY)
            }
        }
        else {
            this.creep.moveTo(12, 14, { maxRooms: 1 })
        }
    }

    public Cleanup(file: ScreepFile) {
        file.WriteToFile(this.state_key, this.data[this.state_key])
    }

    public Unload(file: ScreepFile) {}
}
