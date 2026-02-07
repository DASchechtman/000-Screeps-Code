import { FindOwnedStructureType, FindStructureType, OwnedStructuresConstant, OwnedStructuresTypes } from "Consts"
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
    private struct_map: Map<StructureConstant, Id<Structure<StructureConstant>>[]> = new Map()
    private timer: Timer | null = null
    private constructor() { }

    public SetRoomName(room_name: string) {
        this.room_name = room_name
        this.timer = new Timer(this.room_name)

        this.timer.StartTimer(10)

        if (this.timer.IsTimerDone()) {
            this.construction_site_ids = []
            this.struct_map.clear()
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
        let creeps = new Array<Id<Creep>>()
        for (let creep_name in Game.creeps) {
            const CREEP = Game.creeps[creep_name]
            if (CREEP.room.name !== this.room_name) {
                continue
            }

            creeps.push(CREEP.id)
        }

        return creeps
    }

    public GetOwnedStructureIds<K extends OwnedStructuresConstant, S extends FindOwnedStructureType[K]>(...struct_type: K[]): Id<S>[] {
        const STRUCTS: Id<S>[] = []
        if (struct_type.length > 0 && struct_type.every(k => this.struct_map.has(k))) {
            for (let s of struct_type) {
                STRUCTS.push(...this.struct_map.get(s)! as Id<S>[])
            }
        }
        else {
            for (let struct_id in Game.structures) {
                let struct = Game.structures[struct_id]

                if (struct.room.name !== this.room_name || struct.hits == null) { continue }
                if (!this.struct_map.has(struct.structureType)) {
                    this.struct_map.set(struct.structureType, [])
                }

                const ARR = this.struct_map.get(struct.structureType)!
                if (!ARR.includes(struct.id)) { ARR.push(struct.id) }
            }

            for (let [_, arr] of this.struct_map) {
                STRUCTS.push(...arr as Id<S>[])
            }
        }
        return STRUCTS
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
