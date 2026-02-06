import { JsonObj } from "Consts";
import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { EntityBehavior } from "./BehaviorTypes";
const ENEMIES_FILE = ['enemies', 'blacklist']

export class AttackBehavior implements EntityBehavior {
    private creep: Creep | null
    private enemy_creep_ids: string[]
    private ally_creeps: string[]
    private data: JsonObj
    private state_key: string
    private enemy_key: string
    private enemy_file: ScreepFile

    constructor() {
        this.enemy_creep_ids = []
        this.ally_creeps = []
        this.data = {}
        this.state_key = "state"
        this.enemy_key = "enemies"
        this.creep = null
        this.enemy_file = FileSystem.GetFileSystem().GetFile(ENEMIES_FILE)
    }

    private AddEnemiesToBlacklist() {
        let existing_enemies = this.data[this.enemy_key] as Array<string>

        for (let creep_id of this.enemy_creep_ids) {
            const CREEP = Game.getObjectById(creep_id as Id<Creep>)
            if (CREEP == null) { continue }

            if(!existing_enemies.includes(CREEP.owner.username)) {
                existing_enemies.push(CREEP.owner.username)
            }
        }
    }

    private GetEnemiesOnBlackList() {
        let blacklist = this.data[this.enemy_key] as Array<string>

        return this.enemy_creep_ids.filter(id => {
            const CREEP = Game.getObjectById(id as Id<Creep>)
            if (CREEP == null) { return false }
            return blacklist.includes(CREEP.owner.username)
        })
    }

    public Load(file: ScreepFile, id: string) {
        this.enemy_file = FileSystem.GetFileSystem().GetFile(ENEMIES_FILE)
        this.creep = Game.getObjectById(id as Id<Creep>)
        this.enemy_creep_ids = RoomData.GetRoomData().GetAllEnemyCreepIds()
        this.ally_creeps = RoomData.GetRoomData().GetMyCreepIds()

        let state = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        let enemies = SafeReadFromFileWithOverwrite(this.enemy_file, this.enemy_key, new Array<string>())

        const INJURED_CREEP_COUNT = this.ally_creeps
            .map(c => Game.getObjectById(c as Id<Creep>))
            .filter(c => c != null && c.hits < c.hitsMax).length

        if (INJURED_CREEP_COUNT > 0) {
            this.data[this.state_key] = true
        }
        else {
            this.data[this.state_key] = false
        }

        this.data[this.state_key] = state
        this.data[this.enemy_key] = enemies

        return this.creep != null
    }

    public Run() {
        if (this.creep == null) { return }
        let blacklist = this.GetEnemiesOnBlackList()

        if (this.enemy_creep_ids.length > 0 && (this.data[this.state_key] || blacklist.length > 0)) {
            this.AddEnemiesToBlacklist()
            const ENEMY = Game.getObjectById(blacklist[0] as Id<Creep>)
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
        this.enemy_file.WriteToFile(this.enemy_key, this.data[this.enemy_key])
    }

    public Unload(file: ScreepFile) { }
}
