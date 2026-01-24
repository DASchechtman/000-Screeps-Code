import { CreepBehavior } from "Creeps/Creep";
import { ScreepFile } from "FileSystem/File";
import { RoomData } from "Rooms/RoomData";

export class AttackBehavior implements CreepBehavior {
    private creep: Creep | null
    private enemy_creep_ids: string[]
    constructor(id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        this.enemy_creep_ids = RoomData.GetRoomData().GetAllEnemyCreepIds()
    }

    public Load(file: ScreepFile) {
        return this.creep != null
    }

    public Run() {
        if (this.creep == null) { return }

        if (this.enemy_creep_ids.length > 0) {
            const ENEMY = Game.getObjectById(this.enemy_creep_ids[0] as Id<Creep>)
            if (!ENEMY) { return }

            if (this.creep.attack(ENEMY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(ENEMY)
            }
        }
        else {
            this.creep.moveTo(12, 14, { maxRooms: 1})
        }
    }

    public Cleanup(file: ScreepFile) {}
}
