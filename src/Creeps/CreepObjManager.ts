import { ScreepFile } from "FileSystem/File";
import { CreepObj } from "./Creep";
import { ATTACK_TYPE, BUILDER_TYPE, HARVESTER_TYPE, REPAIR_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { DebugLogger } from "utils/DebugLogger";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";

type CreepQueueData = { body: BodyPartConstant[], limit: number | null, creep_type: number }

export class CreepObjectManager {
    private static manager: CreepObjectManager | null = null

    public static GetCreepManager() {
        if (this.manager === null) { this.manager = new CreepObjectManager() }
        return this.manager
    }

    private creep: CreepObj
    private filler_data
    private file_path: string[]
    private ids: string[][]
    private room_name: string

    private constructor() {
        this.creep = new CreepObj()
        this.file_path = []
        this.ids = []
        this.room_name = ""
        this.filler_data = "empty"
    }


    private RunCreepCode(behavior: number, id_arr: string[], file: ScreepFile) {
        const IDS_TO_REMOVE = new Array<string>()
        let deletion_occured = false
        for (let id of id_arr) {
            this.creep.FullyOverrideCreep(id, behavior)

            this.creep.Load(() => {
                IDS_TO_REMOVE.push(id)
                deletion_occured = true
            })
            this.creep.Run()
            this.creep.Cleanup()
        }

        for (let id of IDS_TO_REMOVE) {
            const INDEX = id_arr.indexOf(id)
            if (INDEX >= 0) { id_arr.splice(INDEX, 1) }
        }

        if (deletion_occured) {
            file.WriteToFile(behavior, id_arr)
        }
    }

    public LoadCreepData(room_name: string) {
        this.room_name = room_name
        this.file_path = ['creeps', `_${room_name}`, 'info']
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        this.ids[HARVESTER_TYPE] = SafeReadFromFileWithOverwrite(FILE, HARVESTER_TYPE, new Array<string>())
        this.ids[UPGRADER_TYPE] = SafeReadFromFileWithOverwrite(FILE, UPGRADER_TYPE, new Array<string>())
        this.ids[BUILDER_TYPE] = SafeReadFromFileWithOverwrite(FILE, BUILDER_TYPE, new Array<string>())
        this.ids[REPAIR_TYPE] = SafeReadFromFileWithOverwrite(FILE, REPAIR_TYPE, new Array<string>())
        this.ids[ATTACK_TYPE] = SafeReadFromFileWithOverwrite(FILE, ATTACK_TYPE, new Array<string>())
    }

    public RunAllActiveCreeps() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const HARVESER_IDS = this.ids[HARVESTER_TYPE].filter(x => x !== this.filler_data)
        const UPGRADER_IDS = this.ids[UPGRADER_TYPE].filter(x => x !== this.filler_data)
        const BUILDER_IDS = this.ids[BUILDER_TYPE].filter(x => x !== this.filler_data)
        const REPAIRER_IDS = this.ids[REPAIR_TYPE].filter(x => x !== this.filler_data)
        const ATTACKER_IDS = this.ids[ATTACK_TYPE].filter(x => x !== this.filler_data)

        this.RunCreepCode(HARVESTER_TYPE, HARVESER_IDS, FILE)
        this.RunCreepCode(UPGRADER_TYPE, UPGRADER_IDS, FILE)
        this.RunCreepCode(BUILDER_TYPE, BUILDER_IDS, FILE)
        this.RunCreepCode(REPAIR_TYPE, REPAIRER_IDS, FILE)
        this.RunCreepCode(ATTACK_TYPE, ATTACKER_IDS, FILE)
    }

    public AddCreepId(id: string) {

        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const QUEUE = SafeReadFromFileWithOverwrite(FILE, 'body_queue', new Array<CreepQueueData>())

        if (this.ids.some(arr => arr.includes(id))) { return }
        console.log(`adding creep: ${id}`)

        const NEXT_CREEP = QUEUE.at(0)

        if (NEXT_CREEP == null) { return }
        const ARR = this.ids[NEXT_CREEP.creep_type]
        const INDEX = ARR.indexOf(this.filler_data)

        if (INDEX >= 0) {
            console.log('found empty spot')
            ARR[INDEX] = id
            QUEUE.shift()
        }

        FILE.WriteAllToFile([
            { key: HARVESTER_TYPE, value: this.ids[HARVESTER_TYPE] },
            { key: UPGRADER_TYPE, value: this.ids[UPGRADER_TYPE] },
            { key: BUILDER_TYPE, value: this.ids[BUILDER_TYPE] },
            { key: REPAIR_TYPE, value: this.ids[REPAIR_TYPE] },
            { key: ATTACK_TYPE, value: this.ids[ATTACK_TYPE] },
            { key: 'body_queue', value: QUEUE }
        ])
    }

    public GetSpawnBody() {
        const EXTENSIONS = RoomData.GetRoomData().GetOwnedStructureIds([STRUCTURE_EXTENSION])
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

        let max_energy = 300
        let controller = Game.rooms[this.room_name]?.controller

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
        let harvest_ids = this.ids[HARVESTER_TYPE]
        let upgrader_ids = this.ids[UPGRADER_TYPE]
        let builder_ids = this.ids[BUILDER_TYPE]
        let repairer_ids = this.ids[REPAIR_TYPE]
        let attacker_ids = this.ids[ATTACK_TYPE]
        const MY_CREEPS = RoomData.GetRoomData().GetCreepIds()
        const CONSTRUCTION_SITE = RoomData.GetRoomData().GetConstructionSites()
        const ENERGY_LIMIT = 1200
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const QUEUE = SafeReadFromFileWithOverwrite(FILE, 'body_queue', new Array<CreepQueueData>())

        const FillArrayWithPlaceHolders = (arr: string[], max: number, fn: (v: string) => void) => {
            const SIZE = max - arr.length
            if (SIZE < 1) { return }

            const PLACE_HOLDERS = new Array<string>(SIZE).fill(this.filler_data)

            for (let v of PLACE_HOLDERS) {
                fn(v)
                arr.push(v)
            }
        }

        if (MY_CREEPS.length === 0) {
            if (QUEUE.length === 0) {
                harvest_ids = []
                upgrader_ids = []
                repairer_ids = []
                builder_ids = []
                attacker_ids = []
            }

            FillArrayWithPlaceHolders(harvest_ids, 1, () => {
                QUEUE.push({ body: [WORK, MOVE, CARRY], limit: 300, creep_type: HARVESTER_TYPE })
            })
        }

        FillArrayWithPlaceHolders(attacker_ids, 3, () => {
            QUEUE.push({ body: [WORK, ATTACK], limit: null, creep_type: ATTACK_TYPE })
        })

        FillArrayWithPlaceHolders(harvest_ids, 2, () => {
            QUEUE.push({ body: [WORK, MOVE, CARRY], limit: ENERGY_LIMIT, creep_type: HARVESTER_TYPE })
        })

        FillArrayWithPlaceHolders(upgrader_ids, 2, () => {
            QUEUE.push({ body: [MOVE, CARRY, WORK], limit: ENERGY_LIMIT, creep_type: UPGRADER_TYPE })
        })

        if (CONSTRUCTION_SITE.length > 0) {
            FillArrayWithPlaceHolders(builder_ids, 1, () => {
                QUEUE.push({ body: [MOVE, WORK, CARRY, CARRY, WORK], limit: ENERGY_LIMIT, creep_type: BUILDER_TYPE })
            })
        }


        FillArrayWithPlaceHolders(repairer_ids, 2, () => {
            QUEUE.push({ body: [MOVE, MOVE, CARRY, WORK, WORK], limit: ENERGY_LIMIT, creep_type: REPAIR_TYPE })
        })




        FILE.WriteAllToFile([
            { key: HARVESTER_TYPE, value: harvest_ids },
            { key: UPGRADER_TYPE, value: upgrader_ids },
            { key: BUILDER_TYPE, value: builder_ids },
            { key: REPAIR_TYPE, value: repairer_ids },
            { key: ATTACK_TYPE, value: attacker_ids },
            { key: 'body_queue', value: QUEUE }
        ])
    }
}
