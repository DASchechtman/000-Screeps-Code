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
        const STRUCTS: Id<S>[] = []
        if (struct_type.length === 0) {
            const NOT_FOUND_TYPES = new Array<StructureConstant>()
            for (let struct_const of OwnedStructuresTypes) {
                if (!this.struct_map.has(struct_const)) { NOT_FOUND_TYPES.push(struct_const) }
            }

            for (let struct of Array.from(Object.values(Game.structures))) {
                const TYPE_PRESENT_IN_MAP = !NOT_FOUND_TYPES.includes(struct.structureType)
                if (TYPE_PRESENT_IN_MAP) { continue }

                if (!this.struct_map.has(struct.structureType)) {
                    this.struct_map.set(struct.structureType, [])
                }
                this.struct_map.get(struct.structureType)!.push(struct.id)
            }

            for (let [_, struct_ids] of this.struct_map) {
                STRUCTS.push(...struct_ids as Id<S>[])
            }
        }
        else {
            for (let struct_const of struct_type) {
                if (!this.struct_map.has(struct_const)) {
                    const NEW_STRUCTS = new Array<Id<Structure<StructureConstant>>>()
                    for (let struct of Array.from(Object.values(Game.structures))) {
                        if (struct.room.name !== this.room_name) { continue }
                        if (struct.structureType !== struct_const) { continue }
                        NEW_STRUCTS.push(struct.id)
                    }
                    this.struct_map.set(struct_const, NEW_STRUCTS)
                    STRUCTS.push(...NEW_STRUCTS as Id<S>[])
                }
                else {
                    const NEW_STRUCTS = this.struct_map.get(struct_const)!
                    STRUCTS.push(...NEW_STRUCTS as Id<S>[])
                }
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
