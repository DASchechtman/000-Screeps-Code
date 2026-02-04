import { FindOwnedStructureType, FindStructureType, OwnedStructuresConstant } from "Consts"
import { Position } from "source-map"
import { DebugLogger } from "utils/DebugLogger"
import { Timer } from "utils/Timer"



export class RoomData {
    private static manager: RoomData | null = null

    public static GetRoomData() {
        if (this.manager === null) {
            this.manager = new RoomData()
        }

        return this.manager
    }

    private room_name: string = ""
    private creep_ids: Id<Creep>[] = []
    private enemy_creep_ids: Id<Creep>[] = []
    private construction_site_ids: Id<ConstructionSite>[] = []
    private container_ids: Id<StructureExtension>[] = []
    private timer: Timer | null = null
    private constructor() { }

    public SetRoomName(room_name: string) {
        this.room_name = room_name
        this.timer = new Timer(this.room_name)

        this.timer.StartTimer(5)

        if (this.timer.IsTimerDone()) {
            this.construction_site_ids = []
        }

        this.creep_ids = []
        this.enemy_creep_ids = []

    }

    public GetAllEnemyCreepIds() {
        if (!Game.rooms[this.room_name]) { return [] }
        if (this.enemy_creep_ids.length === 0) {
            this.enemy_creep_ids = Game.rooms[this.room_name].find(FIND_HOSTILE_CREEPS).map(hc => hc.id)
        }
        return this.enemy_creep_ids
    }

    public GetMyCreepIds() {
        if (this.creep_ids.length === 0) {
            for (let creep_name in Game.creeps) {
                const CREEP = Game.creeps[creep_name]
                if (CREEP.room.name !== this.room_name) { continue }
                this.creep_ids.push(CREEP.id)
            }
        }

        return this.creep_ids
    }

    public GetOwnedStructureIds<K extends OwnedStructuresConstant, S extends FindOwnedStructureType[K]>(...struct_type: K[]): Id<S>[] {
        let x = Array.from(Object.values(Game.structures))
            .filter(s => {
                if (struct_type.length === 0) { return true }
                if (s.room.name !== this.room_name) { return false }
                return struct_type?.some(x => x === s.structureType)
            }) as S[]


        return x.map(s => s.id as Id<S>)
    }

    public GetConstructionSites() {
        if (this.construction_site_ids.length === 0) {
            for (let site_key in Game.constructionSites) {
                const SITE = Game.constructionSites[site_key]
                if (SITE.room?.name !== this.room_name) { continue }
                this.construction_site_ids.push(SITE.id)
            }
        }
        return this.construction_site_ids
    }

    public GetRoomStructures<K extends StructureConstant, S extends FindStructureType[K]>(struct_type: K | K[]): Id<S>[] {
        if (!Game.rooms[this.room_name]) { return [] }

        return Game.rooms[this.room_name].find(FIND_STRUCTURES, {
            filter: s => {
                if (Array.isArray(struct_type)) { return struct_type.some(x => x === s.structureType) }
                return struct_type === s.structureType
            }
        }).map(s => s.id) as Id<S>[]
    }
}
