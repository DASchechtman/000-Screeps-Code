import { ScreepFile } from "FileSystem/File";
import { CreepObj } from "./Creep";
import { ATTACK_TYPE, BUILDER_TYPE, CreepBehaviorType, HARVESTER_TYPE, REPAIR_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { DebugLogger } from "utils/DebugLogger";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { BaseJsonValue, CreepBehavior, Json } from "Consts";
import { indexBy } from "lodash";

type CreepQueueData = { body: BodyPartConstant[], limit: number | null, creep_type: CreepBehaviorType }
type DataObj = { [key: number | string]: Json }

export class CreepObjectManager {
    private static manager: CreepObjectManager | null = null

    public static GetCreepManager() {
        if (this.manager === null) { this.manager = new CreepObjectManager() }
        return this.manager
    }

    private creep: CreepObj
    private filler_data
    private file_path: string[]
    private room_name: string

    private harvester_ids: string[]
    private upgrader_ids: string[]
    private builder_ids: string[]
    private repair_ids: string[]
    private gaurd_ids: string[]
    private creep_queue: CreepQueueData[]
    private all_ids: (() => string[])[]


    private constructor() {
        this.creep = new CreepObj()
        this.file_path = []
        this.room_name = ""
        this.filler_data = "empty"

        this.harvester_ids = []
        this.upgrader_ids = []
        this.builder_ids = []
        this.repair_ids = []
        this.gaurd_ids = []
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

    private RunCreepCode(behavior: number, id_arr: string[]) {
        const IDS_TO_REMOVE = new Array<string>()
        for (let id of id_arr) {
            if (id === this.filler_data) { continue }

            this.creep.FullyOverrideCreep(id, behavior)

            this.creep.Load((failed_id) => {
                IDS_TO_REMOVE.push(failed_id)
            })
            this.creep.Run()
            this.creep.Cleanup()
        }

        for (let y of IDS_TO_REMOVE) {
            const INDEX = id_arr.indexOf(y)
            if (INDEX >= 0) { id_arr.splice(INDEX, 1) }
        }
    }

    private ReadCreepDataFromFile() {
        this.harvester_ids = this.HarvestIds()
        this.upgrader_ids = this.UpgraderIds()
        this.builder_ids = this.BuilderIds()
        this.repair_ids = this.RepairIds()
        this.gaurd_ids = this.GaurdIds()
        this.creep_queue = this.QueueData()

        this.all_ids = []
        this.all_ids[HARVESTER_TYPE] = () => this.harvester_ids
        this.all_ids[UPGRADER_TYPE] = () => this.upgrader_ids
        this.all_ids[BUILDER_TYPE] = () => this.builder_ids
        this.all_ids[REPAIR_TYPE] = () => this.repair_ids
        this.all_ids[ATTACK_TYPE] = () => this.gaurd_ids
    }

    public LoadCreepData(room_name: string) {
        this.room_name = room_name
        this.file_path = ['creeps', `_${room_name}`, 'info']
        this.ReadCreepDataFromFile()
    }

    public RunAllActiveCreeps() {
        this.RunCreepCode(HARVESTER_TYPE, this.harvester_ids)
        this.RunCreepCode(UPGRADER_TYPE, this.upgrader_ids)
        this.RunCreepCode(REPAIR_TYPE, this.repair_ids)
        this.RunCreepCode(BUILDER_TYPE, this.builder_ids)
        this.RunCreepCode(ATTACK_TYPE, this.gaurd_ids)
    }

    public AddCreepId(id: string) {

        if (this.all_ids.some(arr => arr().includes(id))) { return }

        const NEXT_CREEP = this.creep_queue.shift()
        console.log(`next in queue: ${NEXT_CREEP}`)
        if (NEXT_CREEP == null) { return }

        const CREEP_ARR = this.all_ids[NEXT_CREEP.creep_type]()
        const INDEX = CREEP_ARR.indexOf(this.filler_data)
        if (INDEX >= 0) {
            CREEP_ARR[INDEX] = id
        }
    }

    public GetSpawnBody() {
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

            while (true) {
                let si = i % parts.length
                let energy_needed = BODY_TO_ENERGY_MAP.get(parts[si])!
                if (energy_needed + total_energy > energy_limit) { break }

                total_energy += energy_needed
                new_body.push(parts[si])
                i++
            }

            return new_body
        }

        const QUEUE: CreepQueueData[] = this.creep_queue
        const NEXT_BODY = QUEUE.at(0)

        if (NEXT_BODY == null) {
            return []
        }

        return BuildBody(NEXT_BODY.body, NEXT_BODY.limit)
    }

    public QueueNextSpawnBody() {
        const MY_CREEPS = RoomData.GetRoomData().GetCreepIds()
        const CONSTRUCTION_SITE = RoomData.GetRoomData().GetConstructionSites()
        const ENERGY_LIMIT = 1200

        const FillArrayWithPlaceHolders = (arr: string[], max: number, fn: (v: string) => void) => {
            const SIZE = max - arr.length
            if (SIZE < 1) { return }

            const PLACE_HOLDERS = new Array<string>(SIZE).fill(this.filler_data)

            for (let v of PLACE_HOLDERS) {
                fn(v)
                arr.push(v)
            }
        }

        const NO_HARVESTERS_ACTIVE = this.harvester_ids.filter(x => x !== this.filler_data).length === 0
        if (NO_HARVESTERS_ACTIVE) {
            FillArrayWithPlaceHolders(this.harvester_ids, 1, () => {
                this.creep_queue.unshift({ body: [MOVE, WORK, CARRY], limit: 300, creep_type: HARVESTER_TYPE })
            })
        }

        FillArrayWithPlaceHolders(this.gaurd_ids, 3, () => {
            this.creep_queue.push({ body: [MOVE, ATTACK, TOUGH, TOUGH, TOUGH], limit: null, creep_type: ATTACK_TYPE})
        })

        FillArrayWithPlaceHolders(this.harvester_ids, 3, () => {
            this.creep_queue.push({ body: [MOVE, WORK, CARRY, MOVE, WORK], limit: ENERGY_LIMIT, creep_type: HARVESTER_TYPE})
            console.log('queuing harvester')
        })

        FillArrayWithPlaceHolders(this.upgrader_ids, 2, () => {
            this.creep_queue.push({ body: [WORK, CARRY, MOVE], limit: ENERGY_LIMIT, creep_type: UPGRADER_TYPE})
        })

        const HAS_THINGS_TO_BUILD = CONSTRUCTION_SITE.length > 0
        if (HAS_THINGS_TO_BUILD) {
            FillArrayWithPlaceHolders(this.builder_ids, 1, () => {
                this.creep_queue.push({ body: [MOVE, WORK, CARRY, WORK, CARRY], limit: ENERGY_LIMIT, creep_type: BUILDER_TYPE})
            })
        }

        FillArrayWithPlaceHolders(this.repair_ids, 2, () => {
            this.creep_queue.push({ body: [WORK, CARRY, MOVE, MOVE, MOVE, CARRY], limit: ENERGY_LIMIT, creep_type: REPAIR_TYPE})
        })

    }

    public SaveCreepData() {
        this.HarvestIds(this.harvester_ids)
        this.UpgraderIds(this.upgrader_ids)
        this.BuilderIds(this.builder_ids)
        this.RepairIds(this.repair_ids)
        this.GaurdIds(this.gaurd_ids)
        this.QueueData(this.creep_queue)
    }
}
