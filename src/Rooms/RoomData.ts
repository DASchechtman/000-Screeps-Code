import { FindOwnedStructureType, FindStructureType, OwnedStructuresConstant, OwnedStructuresTypes } from "Consts"
import { EntityBehavior, EntityTypes } from "Creeps/CreepBehaviors.ts/BehaviorTypes"
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
        if (!Game.rooms[this.room_name]) { return [] }
        let ids = Game.rooms[this.room_name].find(FIND_MY_STRUCTURES, {
            filter: s => {
                if (Array.isArray(struct_type)) {
                    if (struct_type.length === 0) { return true }
                    return struct_type.some(x => x === s.structureType)
                }
                return struct_type === s.structureType
            }
        }).map(s => s.id) as Id<S>[]

        return ids
    }

    public GetConstructionSites() {
        if (!Game.rooms[this.room_name]) { return [] }

        if (this.construction_site_ids.length === 0) {
            this.construction_site_ids = Game.rooms[this.room_name].find(FIND_CONSTRUCTION_SITES).map(cs => cs.id)
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

    public AmountOfAvailableEnergyAsPercentage() {
        if (!Game.rooms[this.room_name]) { return -1 }
        const ENERGY_CAPACITY = Game.rooms[this.room_name].energyCapacityAvailable
        const ENERGY_AVAILABLE = Game.rooms[this.room_name].energyAvailable

        if (ENERGY_CAPACITY === 0) { return -2 }

        return ENERGY_AVAILABLE / ENERGY_CAPACITY
    }

    public GetNumberOfEnemiesInRoom() {
        return this.GetAllEnemyCreepIds().length
    }

    public NumOfCreepsInRoom(type: EntityTypes) {
        const ROOM = Game.rooms[this.room_name]
        let counter = 0
        if (!ROOM) { return -1 }

        for (let creep of ROOM.find(FIND_MY_CREEPS)) {
            const NAME = creep.name.toLowerCase()
            const ROLE = EntityTypes[type].toLowerCase().replaceAll("_", " ")

            counter += Number(NAME.includes(ROLE))
        }

        return counter
    }

    public NumOfStructuresInRoom(type: StructureConstant) {
        const ROOM = Game.rooms[this.room_name]
        if (!ROOM) { return -1 }

        return ROOM.find(FIND_STRUCTURES, {
            filter: s => s.structureType === type
        }).length
    }

    public AreThereEnemiesInRoom() {
        const ROOM = Game.rooms[this.room_name]
        if (!ROOM) { return false }

        return ROOM.find(FIND_HOSTILE_CREEPS).length > 0
    }

    public AreThereDamagedStructuresInRoom() {
        const ROOM = Game.rooms[this.room_name]
        if (!ROOM) { return false }
        return ROOM.find(FIND_STRUCTURES, {
            filter: s => s.hits != null && s.hits < s.hitsMax
        }).length > 0
    }

    public AreThereConstructionSitesInRoom() {
        const ROOM = Game.rooms[this.room_name]
        if (!ROOM) { return false }
        return ROOM.find(FIND_CONSTRUCTION_SITES).length > 0
    }

}
