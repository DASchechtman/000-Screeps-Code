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
    private creep_ids: string[] = []
    private construction_site_ids: string[] = []
    private timer: Timer | null = null
    private constructor() { }

    public SetRoomName(room_name: string) {
        this.room_name = room_name
        this.timer = new Timer(this.room_name)

        this.timer.StartTimer(5)

        if (this.timer.IsTimerDone()) {
            DebugLogger.Log('resetting room cache')
            this.creep_ids = []
            this.construction_site_ids = []
        }

    }

    public GetAllEnemyCreepIds() {
        return Game.rooms[this.room_name].find(FIND_HOSTILE_CREEPS).map(hc => hc.id)
    }

    public GetCreepIds() {
        if (this.creep_ids.length === 0) {
            for (let creep_name in Game.creeps) {
                const CREEP = Game.creeps[creep_name]
                if (CREEP.room.name !== this.room_name) { continue }
                this.creep_ids.push(CREEP.id)
            }
        }

        return this.creep_ids
    }

    public GetOwnedStructureIds(struct_type?: StructureConstant) {
        return Array.from(Object.values(Game.structures))
            .filter(s => s.room.name === this.room_name)
            .filter(s => s.structureType === struct_type || struct_type == null)
            .map(s => s.id)
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

    public GetRoomStructures(struct_type: STRUCTURE_WALL) {
        const ROOM = Game.rooms[this.room_name]

        if (ROOM == null) { return [] }

        return ROOM.find(FIND_STRUCTURES, {
            filter: s => s.structureType === struct_type
        }).map(s => s.id)
    }
}
