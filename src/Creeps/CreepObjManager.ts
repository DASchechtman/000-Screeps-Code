import { EntityObj } from "./Creep";
import { EntityTypes } from "./CreepBehaviors.ts/BehaviorTypes";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { Json } from "Consts";

type CreepQueueData = { body: BodyPartConstant[], limit: number | null, creep_type: EntityTypes }
type DataObj = { [key: number | string]: Json }

export class CreepObjectManager {
    private static manager: CreepObjectManager | null = null

    public static GetCreepManager() {
        if (this.manager === null) { this.manager = new CreepObjectManager() }
        return this.manager
    }

    private entity: EntityObj
    private filler_data: string
    private queued_data: string
    private file_path: string[]
    private room_name: string

    private harvester_ids: string[]
    private upgrader_ids: string[]
    private builder_ids: string[]
    private repair_ids: string[]
    private gaurd_ids: string[]
    private tower_ids: string[]
    private tower_supplier_ids: string[]
    private creep_queue: CreepQueueData[]
    private all_ids: (() => string[])[]


    private constructor() {
        this.entity = new EntityObj()
        this.file_path = []
        this.room_name = ""
        this.filler_data = "empty"
        this.queued_data = "queued"

        this.harvester_ids = []
        this.upgrader_ids = []
        this.builder_ids = []
        this.repair_ids = []
        this.gaurd_ids = []
        this.tower_ids = []
        this.tower_supplier_ids = []
        this.creep_queue = []
        this.all_ids = []
    }

    private HarvestIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(EntityTypes.HARVESTER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, EntityTypes.HARVESTER_TYPE, new Array<string>())
        }
    }

    private UpgraderIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(EntityTypes.UPGRADER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, EntityTypes.UPGRADER_TYPE, new Array<string>())
        }
    }

    private BuilderIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(EntityTypes.BUILDER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, EntityTypes.BUILDER_TYPE, new Array<string>())
        }
    }

    private RepairIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(EntityTypes.REPAIR_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, EntityTypes.REPAIR_TYPE, new Array<string>())
        }
    }

    private GaurdIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(EntityTypes.ATTACK_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, EntityTypes.ATTACK_TYPE, new Array<string>())
        }
    }

    private TowerSuppliersIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(EntityTypes.STRUCTURE_SUPPLIER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, EntityTypes.STRUCTURE_SUPPLIER_TYPE, new Array<string>())
        }
    }

    private TowerIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)

        if (new_ids) {
            FILE.WriteToFile(EntityTypes.TOWER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, EntityTypes.TOWER_TYPE, new Array<string>())
        }
    }

    private QueueData(new_queue?: Array<CreepQueueData>): Array<CreepQueueData> {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_queue) {
            FILE.WriteToFile('body_queue', new_queue)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, 'body_queue', new Array<CreepQueueData>())
        }
    }

    private RunEntityCode(behavior: number, id_arr: string[]) {
        const IDS_TO_REMOVE = new Array<number>()
        for (let i = 0; i < id_arr.length; i++) {
            let id = id_arr[i]
            if (id === this.filler_data || id === this.queued_data) { continue }

            this.entity.FullyOverrideCreep(id, behavior)

            this.entity.Load((failed_id) => {
                id_arr[i] = this.filler_data
            })
            this.entity.Run()
            this.entity.Cleanup()
        }


    }

    private ReadCreepDataFromFile() {
        this.harvester_ids = this.HarvestIds()
        this.upgrader_ids = this.UpgraderIds()
        this.builder_ids = this.BuilderIds()
        this.repair_ids = this.RepairIds()
        this.gaurd_ids = this.GaurdIds()
        this.tower_supplier_ids = this.TowerSuppliersIds()
        this.tower_ids = this.TowerIds()
        this.creep_queue = this.QueueData()

        this.all_ids = []
        this.all_ids[EntityTypes.HARVESTER_TYPE] = () => this.harvester_ids
        this.all_ids[EntityTypes.UPGRADER_TYPE] = () => this.upgrader_ids
        this.all_ids[EntityTypes.BUILDER_TYPE] = () => this.builder_ids
        this.all_ids[EntityTypes.REPAIR_TYPE] = () => this.repair_ids
        this.all_ids[EntityTypes.ATTACK_TYPE] = () => this.gaurd_ids
        this.all_ids[EntityTypes.TOWER_TYPE] = () => this.tower_ids
        this.all_ids[EntityTypes.STRUCTURE_SUPPLIER_TYPE] = () => this.tower_supplier_ids
    }

    public LoadEntityData(room_name: string) {
        this.room_name = room_name
        this.file_path = ['entities', `_${room_name}`, 'info']
        this.ReadCreepDataFromFile()
    }

    public RunAllActiveEntities() {
        this.RunEntityCode(EntityTypes.HARVESTER_TYPE, this.harvester_ids)
        this.RunEntityCode(EntityTypes.UPGRADER_TYPE, this.upgrader_ids)
        this.RunEntityCode(EntityTypes.REPAIR_TYPE, this.repair_ids)
        this.RunEntityCode(EntityTypes.BUILDER_TYPE, this.builder_ids)
        this.RunEntityCode(EntityTypes.ATTACK_TYPE, this.gaurd_ids)
        this.RunEntityCode(EntityTypes.STRUCTURE_SUPPLIER_TYPE, this.tower_supplier_ids)
        this.RunEntityCode(EntityTypes.TOWER_TYPE, this.tower_ids)
    }

    public AddCreepId(id: Id<Creep>) {

        if (this.all_ids.some(arr => arr().includes(id))) { return }

        const NEXT_CREEP = this.creep_queue[0]
        this.creep_queue = this.creep_queue.slice(1)
        if (NEXT_CREEP == null) { return }

        const CREEP_ARR = this.all_ids[NEXT_CREEP.creep_type]()
        const INDEX = CREEP_ARR.findIndex(x => x === this.queued_data)
        if (INDEX >= 0) {
            CREEP_ARR[INDEX] = id
        }
    }

    public AddStructureId(id: Id<Structure<StructureConstant>>) {
        if (this.all_ids.some(arr => arr().includes(id))) { return }


        const STRUCT = Game.getObjectById(id)

        if (STRUCT?.structureType === STRUCTURE_TOWER) {
            this.tower_ids.push(id)
        }

    }

    public GetSpawnBody(): [BodyPartConstant[], string] {
        const EXTENSIONS = RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_EXTENSION])
        const SPAWNS = RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_SPAWN])
        const BODY_TO_ENERGY_MAP = new Map<BodyPartConstant, number>([
            [MOVE, 50],
            [WORK, 100],
            [CARRY, 50],
            [ATTACK, 80],
            [RANGED_ATTACK, 150],
            [HEAL, 250],
            [CLAIM, 600],
            [TOUGH, 10]
        ])

        let max_energy = 300 * SPAWNS.length
        let controller = Game.rooms[this.room_name]?.controller

        const CANT_ACCESS_MORE_ENERGY = this.harvester_ids.filter(x => x !== this.filler_data).length === 0
        //const CANT_ACCESS_MORE_ENERGY = false
        if (controller) {
            if (controller.level >= 2 && controller.level <= 6) {
                max_energy += 50 * EXTENSIONS.length
            }
            else if (controller.level === 7) {
                max_energy += 100 * EXTENSIONS.length
            }
            else if (controller.level === 8) {
                max_energy += 200 * EXTENSIONS.length
            }
        }

        if (CANT_ACCESS_MORE_ENERGY) {
            const EXTENSION_OBJS = EXTENSIONS.map(id => Game.getObjectById(id)).filter(s => s != null) as StructureExtension[]
            max_energy = (300 * SPAWNS.length) + EXTENSION_OBJS.reduce((prev, cur) => prev + cur.store.getUsedCapacity(RESOURCE_ENERGY), 0)
        }

        const BuildBody = (parts: BodyPartConstant[], energy_limit: number | undefined | null) => {
            if (energy_limit == null || energy_limit > max_energy) {
                energy_limit = max_energy
            }

            let total_energy = 0
            let i = 0
            let new_body = new Array<BodyPartConstant>()

            while (new_body.length < 50) {
                let si = i % parts.length
                let energy_needed = BODY_TO_ENERGY_MAP.get(parts[si])!
                if (energy_needed + total_energy > energy_limit) { break }

                total_energy += energy_needed
                new_body.push(parts[si])
                i++
            }

            return new_body
        }

        const CreateName = (behavior?: EntityTypes) => {
            const DATE_STR = new Date().toUTCString()
            let name = ['Creep', Game.time]
            if (behavior === EntityTypes.HARVESTER_TYPE) {
                name[0] = 'Harvester'
            }
            else if (behavior === EntityTypes.UPGRADER_TYPE) {
                name[0] = 'Upgrader'
            }
            else if (behavior === EntityTypes.BUILDER_TYPE) {
                name[0] = 'Builder'
            }
            else if (behavior === EntityTypes.REPAIR_TYPE) {
                name[0] = 'Repairer'
            }
            else if (behavior === EntityTypes.ATTACK_TYPE) {
                name[0] = 'Gaurd'
            }
            else if (behavior === EntityTypes.STRUCTURE_SUPPLIER_TYPE) {
                name[0] = 'Tower Supplier'
            }
            return name.join(' - ')
        }

        const QUEUE: CreepQueueData[] = this.creep_queue
        const NEXT_BODY = QUEUE.at(0)

        if (NEXT_BODY == null) {
            return [[], CreateName()]
        }


        return [BuildBody(NEXT_BODY.body, NEXT_BODY.limit), CreateName(NEXT_BODY.creep_type)]
    }

    public QueueNextSpawnBody() {
        const MY_TOWERS = RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_TOWER])
        const CONSTRUCTION_SITE = RoomData.GetRoomData().GetConstructionSites()
        const CONTAINERS = RoomData.GetRoomData().GetRoomStructures([STRUCTURE_CONTAINER])
        const ENERGY_LIMIT = 1200
        const HAS_THINGS_TO_BUILD = CONSTRUCTION_SITE.length > 0
        const NO_HARVESTERS_ACTIVE = this.harvester_ids.filter(x => ![this.filler_data, this.queued_data].includes(x)).length === 0
        const NO_SUPPLIERS_ACTIVE = this.tower_supplier_ids.filter(x => ![this.filler_data, this.queued_data].includes(x)).length === 0
        const CONTAINERS_EXIST = CONTAINERS.length > 0
        const ENEMIES_EXIST = RoomData.GetRoomData().GetAllEnemyCreepIds().length > 0

        const FillArrayWithPlaceHolders = (arr: string[], max: number, fn: () => void) => {
            const END = Math.min(max, 6)
            if (max < 1) {
                fn()
                arr[0] = this.queued_data
                return
            }

            for (let i = 0; i < END; i++) {
                while (i >= arr.length) {
                    arr.push(this.filler_data)
                }
                const SPOT = arr[i]
                if (SPOT === this.filler_data) {
                    fn()
                    arr[i] = this.queued_data
                }
            }
        }

        const GetEmergencyCreepMax = (behavior: EntityTypes, limit: number, emergency_max: number) => {
            const NEXT_IN_QUEUE = this.creep_queue.at(0)
            if (NEXT_IN_QUEUE == null) { return emergency_max }
            if (NEXT_IN_QUEUE.creep_type !== behavior && NEXT_IN_QUEUE.limit !== limit) { return -1 }
            return emergency_max
        }

        if (NO_HARVESTERS_ACTIVE) {
            let max = GetEmergencyCreepMax(EntityTypes.HARVESTER_TYPE, 300, 1)
            console.log('queuing emergency harvesters', max)
            FillArrayWithPlaceHolders(this.harvester_ids, max, () => {
                this.creep_queue.unshift({ body: [MOVE, WORK, CARRY], limit: 300, creep_type: EntityTypes.HARVESTER_TYPE })
                console.log('adding to queue')
            })
        }


        if (NO_SUPPLIERS_ACTIVE && CONTAINERS_EXIST) {
            let max = GetEmergencyCreepMax(EntityTypes.STRUCTURE_SUPPLIER_TYPE, 300, 1)
            console.log('queuing emergency creep')
            FillArrayWithPlaceHolders(this.tower_supplier_ids, max, () => {
                this.creep_queue.unshift({ body: [MOVE, MOVE, CARRY, CARRY, CARRY], limit: 300, creep_type: EntityTypes.STRUCTURE_SUPPLIER_TYPE })
            })
        }

        FillArrayWithPlaceHolders(this.gaurd_ids, 3, () => {
            this.creep_queue.push({ body: [MOVE, ATTACK, TOUGH, TOUGH, TOUGH], limit: null, creep_type: EntityTypes.ATTACK_TYPE })
        })

        if (CONTAINERS_EXIST) {
            const MAX = MY_TOWERS.length === 0 ? 1 : MY_TOWERS.length
            FillArrayWithPlaceHolders(this.tower_supplier_ids, 2, () => {
                this.creep_queue.push({ body: [MOVE, MOVE, CARRY, CARRY, CARRY], limit: 800, creep_type: EntityTypes.STRUCTURE_SUPPLIER_TYPE })
            })
        }

        const NUM_OF_HARVESTERS = CONTAINERS.length === 0 ? 2 : CONTAINERS.length
        FillArrayWithPlaceHolders(this.harvester_ids, NUM_OF_HARVESTERS, () => {
            let max_energy = ENERGY_LIMIT
            let body: BodyPartConstant[] = [MOVE, WORK, CARRY, MOVE, WORK]
            if (CONTAINERS_EXIST) {
                body = [MOVE, CARRY, WORK, WORK, WORK]
                max_energy = 800
            }
            this.creep_queue.push({ body: body, limit: max_energy, creep_type: EntityTypes.HARVESTER_TYPE })
        })

        const NUM_OF_UPGRADERS = ENEMIES_EXIST ? 0 : 2
        FillArrayWithPlaceHolders(this.upgrader_ids, NUM_OF_UPGRADERS, () => {
            this.creep_queue.push({ body: [WORK, CARRY, MOVE], limit: 800, creep_type: EntityTypes.UPGRADER_TYPE })
        })

        if (HAS_THINGS_TO_BUILD) {
            FillArrayWithPlaceHolders(this.builder_ids, 1, () => {
                this.creep_queue.push({ body: [MOVE, WORK, CARRY, WORK, CARRY], limit: ENERGY_LIMIT, creep_type: EntityTypes.BUILDER_TYPE })
            })
        }

        if (!CONTAINERS_EXIST) {
            FillArrayWithPlaceHolders(this.repair_ids, 1, () => {
                this.creep_queue.push({ body: [WORK, CARRY, MOVE, MOVE, MOVE, CARRY], limit: ENERGY_LIMIT, creep_type: EntityTypes.REPAIR_TYPE })
            })
        }

    }

    public SaveCreepData() {
        this.HarvestIds(this.harvester_ids)
        this.UpgraderIds(this.upgrader_ids)
        this.BuilderIds(this.builder_ids)
        this.RepairIds(this.repair_ids)
        this.GaurdIds(this.gaurd_ids)
        this.TowerSuppliersIds(this.tower_supplier_ids)
        this.TowerIds(this.tower_ids)
        this.QueueData(this.creep_queue)
    }
}
