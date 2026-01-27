import { ScreepFile } from "FileSystem/File";
import { CreepObj } from "./Creep";
import { ATTACK_TYPE, BUILDER_TYPE, HARVESTER_TYPE, REPAIR_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { DebugLogger } from "utils/DebugLogger";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { BaseJsonValue, Json } from "Consts";

type CreepQueueData = { body: BodyPartConstant[], limit: number | null, creep_type: number }
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

    private constructor() {
        this.creep = new CreepObj()
        this.file_path = []
        this.room_name = ""
        this.filler_data = "empty"
    }


    private RunCreepCode(behavior: number, id_arr: string[]) {
        const IDS_TO_REMOVE = new Array<string>()
        let deletion_occured = false
        for (let i = 0; i < id_arr.length; i++) {
            let id = id_arr[i]
            this.creep.FullyOverrideCreep(id, behavior)

            this.creep.Load((failed_id) => {
                if (failed_id === this.filler_data) { return }
                IDS_TO_REMOVE.push(failed_id)
                deletion_occured = true
            })
            this.creep.Run()
            this.creep.Cleanup()
        }

        console.log(`remove ids: ${IDS_TO_REMOVE}, ids: ${id_arr}`)

        for(let y of IDS_TO_REMOVE) {
            const INDEX = id_arr.indexOf(y)
            if (INDEX >= 0) { id_arr.splice(INDEX, 1) }
        }
    }

    private ReadCreepDataFromFile() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)

    }

    public LoadCreepData(room_name: string) {
        this.room_name = room_name
        this.file_path = ['creeps', `_${room_name}`, 'info']
        this.ReadCreepDataFromFile()
    }

    public RunAllActiveCreeps() {
        const HARVESER_IDS = this.HarvestIds()
        const UPGRADER_IDS = this.UpgraderIds()
        const BUILDER_IDS = this.BuilderIds()
        const REPAIRER_IDS = this.RepairIds()
        const ATTACKER_IDS = this.GaurdIds()

        this.RunCreepCode(HARVESTER_TYPE, HARVESER_IDS)
        this.RunCreepCode(UPGRADER_TYPE, UPGRADER_IDS)
        this.RunCreepCode(BUILDER_TYPE, BUILDER_IDS)
        this.RunCreepCode(REPAIR_TYPE, REPAIRER_IDS)
        this.RunCreepCode(ATTACK_TYPE, ATTACKER_IDS)

        console.log(HARVESER_IDS)

        this.HarvestIds(HARVESER_IDS)
        this.UpgraderIds(UPGRADER_IDS)
        this.BuilderIds(BUILDER_IDS)
        this.RepairIds(REPAIRER_IDS)
        this.GaurdIds(ATTACKER_IDS)
    }

    public AddCreepId(id: string) {
        const QUEUE = this.QueueData()
        const IDS = [
            this.HarvestIds(),
            this.UpgraderIds(),
            this.BuilderIds(),
            this.RepairIds(),
            this.GaurdIds()
        ]

        if (IDS.some(arr => arr.includes(id))) { return }

        const NEXT_CREEP = QUEUE.shift()
        if (NEXT_CREEP == null) { return }
        this.QueueData(QUEUE)

        const ARR = IDS[NEXT_CREEP.creep_type]
        const INDEX = ARR.indexOf(this.filler_data)

        if (INDEX >= 0) {
            ARR[INDEX] = id
        }
    }

    public GetSpawnBody() {
        const EXTENSIONS = RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_EXTENSION])
        const SPAWNS = RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_SPAWN])
        const HARVESER_IDS = this.HarvestIds()
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

        const CANT_ACCESS_MORE_ENERGY = HARVESER_IDS.filter(x => x !== this.filler_data).length === 0
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

        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const QUEUE = SafeReadFromFileWithOverwrite(FILE, 'body_queue', new Array<CreepQueueData>())


        const NEXT_BODY = QUEUE.at(0)

        if (NEXT_BODY == null) {
            return []
        }

        return BuildBody(NEXT_BODY.body, NEXT_BODY.limit)
    }

    public QueueNextSpawnBody() {
        let harvest_ids = this.HarvestIds()
        let upgrader_ids = this.UpgraderIds()
        let builder_ids = this.BuilderIds()
        let repairer_ids = this.RepairIds()
        let attacker_ids = this.GaurdIds()
        let queue = this.QueueData()
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

        if (MY_CREEPS.length === 0 || harvest_ids.filter(x => x !== this.filler_data).length === 0) {
            harvest_ids = []
            upgrader_ids = []
            repairer_ids = []
            builder_ids = []
            attacker_ids = []
            queue = []

            FillArrayWithPlaceHolders(harvest_ids, 1, () => {
                queue.unshift({ body: [MOVE, WORK, CARRY], limit: 300, creep_type: HARVESTER_TYPE })
            })
        }

        FillArrayWithPlaceHolders(attacker_ids, 3, () => {
            queue.push({ body: [MOVE, MOVE, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH], limit: null, creep_type: ATTACK_TYPE })
        })

        FillArrayWithPlaceHolders(harvest_ids, 3, () => {
            queue.push({ body: [MOVE, MOVE, WORK, WORK, CARRY], limit: ENERGY_LIMIT, creep_type: HARVESTER_TYPE })
        })

        FillArrayWithPlaceHolders(upgrader_ids, 2, () => {
            queue.push({ body: [MOVE, CARRY, WORK], limit: ENERGY_LIMIT, creep_type: UPGRADER_TYPE })
        })

        if (CONSTRUCTION_SITE.length > 0) {
            FillArrayWithPlaceHolders(builder_ids, 2, () => {
                queue.push({ body: [MOVE, WORK, CARRY, CARRY, WORK], limit: ENERGY_LIMIT, creep_type: BUILDER_TYPE })
            })
        }


        FillArrayWithPlaceHolders(repairer_ids, 2, () => {
            queue.push({ body: [MOVE, MOVE, CARRY, WORK, WORK], limit: ENERGY_LIMIT, creep_type: REPAIR_TYPE })
        })

        this.HarvestIds(harvest_ids)
        this.UpgraderIds(upgrader_ids)
        this.BuilderIds(builder_ids)
        this.RepairIds(repairer_ids)
        this.GaurdIds(attacker_ids)
        this.QueueData(queue)

    }

    public SaveCreepData() {
    }
}
