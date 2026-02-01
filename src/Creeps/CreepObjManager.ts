import { EntityObj } from "./Creep";
import { ATTACK_TYPE, BUILDER_TYPE, EntityBehaviorType, HARVESTER_TYPE, REPAIR_TYPE, STRUCTURE_SUPPLIER_TYPE, TOWER_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { Json } from "Consts";

type CreepQueueData = { body: BodyPartConstant[], limit: number | null, creep_type: EntityBehaviorType }
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
            FILE.WriteToFile(HARVESTER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, HARVESTER_TYPE, new Array<string>())
        }
    }

    private UpgraderIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(UPGRADER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, UPGRADER_TYPE, new Array<string>())
        }
    }

    private BuilderIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(BUILDER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, BUILDER_TYPE, new Array<string>())
        }
    }

    private RepairIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(REPAIR_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, REPAIR_TYPE, new Array<string>())
        }
    }

    private GaurdIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(ATTACK_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, ATTACK_TYPE, new Array<string>())
        }
    }

    private TowerSuppliersIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        if (new_ids) {
            FILE.WriteToFile(STRUCTURE_SUPPLIER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, STRUCTURE_SUPPLIER_TYPE, new Array<string>())
        }
    }

    private TowerIds(new_ids?: string[]): string[] {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)

        if (new_ids) {
            FILE.WriteToFile(TOWER_TYPE, new_ids)
            return []
        }
        else {
            return SafeReadFromFileWithOverwrite(FILE, TOWER_TYPE, new Array<string>())
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
        this.all_ids[HARVESTER_TYPE] = () => this.harvester_ids
        this.all_ids[UPGRADER_TYPE] = () => this.upgrader_ids
        this.all_ids[BUILDER_TYPE] = () => this.builder_ids
        this.all_ids[REPAIR_TYPE] = () => this.repair_ids
        this.all_ids[ATTACK_TYPE] = () => this.gaurd_ids
        this.all_ids[TOWER_TYPE] = () => this.tower_ids
        this.all_ids[STRUCTURE_SUPPLIER_TYPE] = () => this.tower_supplier_ids
    }

    public LoadEntityData(room_name: string) {
        this.room_name = room_name
        this.file_path = ['entities', `_${room_name}`, 'info']
        this.ReadCreepDataFromFile()
    }

    public RunAllActiveEntities() {
        this.RunEntityCode(HARVESTER_TYPE, this.harvester_ids)
        this.RunEntityCode(UPGRADER_TYPE, this.upgrader_ids)
        this.RunEntityCode(REPAIR_TYPE, this.repair_ids)
        this.RunEntityCode(BUILDER_TYPE, this.builder_ids)
        this.RunEntityCode(ATTACK_TYPE, this.gaurd_ids)
        this.RunEntityCode(STRUCTURE_SUPPLIER_TYPE, this.tower_supplier_ids)
        this.RunEntityCode(TOWER_TYPE, this.tower_ids)
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

        const CreateName = (behavior?: EntityBehaviorType) => {
            const DATE_STR = new Date().toUTCString()
            let name = ['Creep', Game.time]
            if (behavior === HARVESTER_TYPE) {
                name[0] = 'Harvester'
            }
            else if (behavior === UPGRADER_TYPE) {
                name[0] = 'Upgrader'
            }
            else if (behavior === BUILDER_TYPE) {
                name[0] = 'Builder'
            }
            else if (behavior === REPAIR_TYPE) {
                name[0] = 'Repairer'
            }
            else if (behavior === ATTACK_TYPE) {
                name[0] = 'Gaurd'
            }
            else if (behavior === STRUCTURE_SUPPLIER_TYPE) {
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

        const FillArrayWithPlaceHolders = (arr: string[], max: number, fn: (val: string, i: number) => void) => {
            const END = Math.min(max, 6)
            for (let i = 0; i < END; i++) {
                while (i >= arr.length) {
                    arr.push(this.filler_data)
                }
                const SPOT = arr[i]
                if (SPOT === this.filler_data || max === -1) {
                    fn(SPOT, i)
                    arr[i] = this.queued_data
                    if (max === -1) { break }
                }
            }
        }

        if (NO_HARVESTERS_ACTIVE) {
            let max = 1
            let next = this.creep_queue[0]
            if (next.creep_type !== HARVESTER_TYPE && next.limit !== 300) {
                max = -1
            }
            FillArrayWithPlaceHolders(this.harvester_ids, max, (val, i) => {
                this.creep_queue.unshift({ body: [MOVE, WORK, CARRY], limit: 300, creep_type: HARVESTER_TYPE })
            })
        }

        if (NO_SUPPLIERS_ACTIVE && CONTAINERS_EXIST) {
            let max = 1
            let next = this.creep_queue[0]
            if (next.creep_type !== STRUCTURE_SUPPLIER_TYPE && next.limit !== 300) {
                max = -1
            }
            FillArrayWithPlaceHolders(this.tower_supplier_ids, max, () => {
                this.creep_queue.unshift({ body: [MOVE, MOVE, CARRY, CARRY, CARRY], limit: 300, creep_type: STRUCTURE_SUPPLIER_TYPE })
            })
        }

        FillArrayWithPlaceHolders(this.gaurd_ids, 3, () => {
            this.creep_queue.push({ body: [MOVE, ATTACK, TOUGH, TOUGH, TOUGH], limit: null, creep_type: ATTACK_TYPE })
        })

        if (CONTAINERS_EXIST) {
            const MAX = MY_TOWERS.length === 0 ? 1 : MY_TOWERS.length
            FillArrayWithPlaceHolders(this.tower_supplier_ids, 2, () => {
                this.creep_queue.push({ body: [MOVE, MOVE, CARRY, CARRY, CARRY], limit: ENERGY_LIMIT, creep_type: STRUCTURE_SUPPLIER_TYPE })
            })
        }

        const NUM_OF_HARVESTERS = CONTAINERS.length === 0 ? 2 : CONTAINERS.length
        FillArrayWithPlaceHolders(this.harvester_ids, NUM_OF_HARVESTERS, () => {
            this.creep_queue.push({ body: [MOVE, WORK, CARRY, MOVE, WORK], limit: ENERGY_LIMIT, creep_type: HARVESTER_TYPE })
        })

        FillArrayWithPlaceHolders(this.upgrader_ids, 1, () => {
            this.creep_queue.push({ body: [WORK, CARRY, MOVE], limit: ENERGY_LIMIT, creep_type: UPGRADER_TYPE })
        })

        if (HAS_THINGS_TO_BUILD) {
            FillArrayWithPlaceHolders(this.builder_ids, 1, () => {
                this.creep_queue.push({ body: [MOVE, WORK, CARRY, WORK, CARRY], limit: ENERGY_LIMIT, creep_type: BUILDER_TYPE })
            })
        }

        if (!CONTAINERS_EXIST) {
            FillArrayWithPlaceHolders(this.repair_ids, 1, () => {
                this.creep_queue.push({ body: [WORK, CARRY, MOVE, MOVE, MOVE, CARRY], limit: ENERGY_LIMIT, creep_type: REPAIR_TYPE })
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
