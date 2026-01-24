import { ScreepFile } from "FileSystem/File";
import { CreepObj } from "./Creep";
import { ATTACK_TYPE, BUILDER_TYPE, HARVESTER_TYPE, REPAIR_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { DebugLogger } from "utils/DebugLogger";
import { SafelyReadFromFiletry } from "utils/UtilFuncs";

export class CreepObjectManager {
    private static manager: CreepObjectManager | null = null

    public static GetCreepManager() {
        if (this.manager === null) { this.manager = new CreepObjectManager() }
        return this.manager
    }

    private creep_pool: Array<CreepObj>
    private available_creeps: Map<CreepObj, number>
    private reserved_creeps: Map<CreepObj, number>
    private creep_body: BodyPartConstant[] = []
    private file_path: string[]
    private ids: string[][] = []

    private constructor() {
        this.creep_pool = []
        this.available_creeps = new Map()
        this.reserved_creeps = new Map()
        this.file_path = ['creeps', 'info']
    }

    private GiveCreep(id: string, behavior_type: number) {
        const ITERATOR = this.available_creeps.keys()
        const CREEP = ITERATOR.next().value

        if (CREEP == null) {
            const NEW_CREEP = new CreepObj()
            NEW_CREEP.OverrideCreep(id)
            NEW_CREEP.OverrideBehavior(behavior_type)

            this.creep_pool.push(NEW_CREEP)
            this.reserved_creeps.set(NEW_CREEP, this.creep_pool.length - 1)
            return NEW_CREEP
        }

        CREEP.OverrideCreep(id)
        CREEP.OverrideBehavior(behavior_type)
        const CREEP_INDEX = this.available_creeps.get(CREEP)!
        this.available_creeps.delete(CREEP)
        this.reserved_creeps.set(CREEP, CREEP_INDEX)

        return CREEP
    }

    private ReturnCreep(creep: CreepObj) {
        if (this.reserved_creeps.has(creep)) {
            const INDEX = this.reserved_creeps.get(creep)!
            this.reserved_creeps.delete(creep)
            this.available_creeps.set(creep, INDEX)
        }
    }

    private RunCreepCode(behavior: number, id_arr: string[], file: ScreepFile) {
        const IDS_TO_REMOVE = new Array<string>()
        for (let id of id_arr) {
            const CREEP = this.GiveCreep(id, behavior)
            CREEP.Load(() => {
                IDS_TO_REMOVE.push(id)
            })
            CREEP.Run()
            CREEP.Cleanup()
            this.ReturnCreep(CREEP)
        }

        for (let id of IDS_TO_REMOVE) {
            const INDEX = id_arr.indexOf(id)
            if (INDEX >= 0) { id_arr.splice(INDEX, 1) }
        }

        if (id_arr.length > 0) {
            file.WriteToFile(behavior, id_arr)
        }
    }

    public LoadCreepData() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        this.ids[HARVESTER_TYPE] = SafelyReadFromFiletry(FILE, HARVESTER_TYPE, new Array<string>())
        this.ids[UPGRADER_TYPE] = SafelyReadFromFiletry(FILE, UPGRADER_TYPE, new Array<string>())
        this.ids[BUILDER_TYPE] = SafelyReadFromFiletry(FILE, BUILDER_TYPE, new Array<string>())
        this.ids[REPAIR_TYPE] = SafelyReadFromFiletry(FILE, REPAIR_TYPE, new Array<string>())
        this.ids[ATTACK_TYPE] = SafelyReadFromFiletry(FILE, ATTACK_TYPE, new Array<string>())
    }

    public RunAllActiveCreeps() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const HARVESER_IDS = this.ids[HARVESTER_TYPE]
        const UPGRADER_IDS = this.ids[UPGRADER_TYPE]
        const BUILDER_IDS = this.ids[BUILDER_TYPE]
        const REPAIRER_IDS = this.ids[REPAIR_TYPE]
        const ATTACKER_IDS = this.ids[ATTACK_TYPE]

        this.RunCreepCode(HARVESTER_TYPE, HARVESER_IDS, FILE)
        this.RunCreepCode(UPGRADER_TYPE, UPGRADER_IDS, FILE)
        this.RunCreepCode(BUILDER_TYPE, BUILDER_IDS, FILE)
        this.RunCreepCode(REPAIR_TYPE, REPAIRER_IDS, FILE)
        this.RunCreepCode(ATTACK_TYPE, ATTACKER_IDS, FILE)
    }

    public AddCreepId(id: string) {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const HARVESER_IDS = this.ids[HARVESTER_TYPE]
        const UPGRADER_IDS = this.ids[UPGRADER_TYPE]
        const BUILDER_IDS = this.ids[BUILDER_TYPE]
        const REPAIRER_IDS = this.ids[REPAIR_TYPE]
        const ATTACKER_IDS = this.ids[ATTACK_TYPE]
        const CONSTRUCTION_SITE = RoomData.GetRoomData().GetConstructionSites()

        if (this.ids.some(arr => arr.includes(id))) { return }

        if (ATTACKER_IDS.length < 3) {
            ATTACKER_IDS.push(id)
        }
        else if (HARVESER_IDS.length < 2) {
            HARVESER_IDS.push(id)
            DebugLogger.Log(`add id - ${id} - harvester`)
        }
        else if (UPGRADER_IDS.length < 2) {
            UPGRADER_IDS.push(id)
            DebugLogger.Log(`add id - ${id} - upgrader`)
        }
        else if (BUILDER_IDS.length < 1 && CONSTRUCTION_SITE.length > 0) {
            BUILDER_IDS.push(id)
            DebugLogger.Log(`add id - ${id} - builder`)
        }
        else if (REPAIRER_IDS.length < 2) {
            REPAIRER_IDS.push(id)
            DebugLogger.Log(`add id - ${id} - repairer`)
        }
        else {
            this.creep_body = []
        }

        FILE.WriteToFile(HARVESTER_TYPE, HARVESER_IDS)
        FILE.WriteToFile(UPGRADER_TYPE, UPGRADER_IDS)
        FILE.WriteToFile(BUILDER_TYPE, BUILDER_IDS)
        FILE.WriteToFile(REPAIR_TYPE, REPAIRER_IDS)
    }

    public GetSpawnBody() {
        const HARVESER_IDS = this.ids[HARVESTER_TYPE]
        const UPGRADER_IDS = this.ids[UPGRADER_TYPE]
        const BUILDER_IDS = this.ids[BUILDER_TYPE]
        const REPAIRER_IDS = this.ids[REPAIR_TYPE]
        const ATTACKER_IDS = this.ids[ATTACK_TYPE]
        const CONSTRUCTION_SITE = RoomData.GetRoomData().GetConstructionSites()

        if (ATTACKER_IDS.length < 3) {
            this.creep_body = [MOVE, MOVE, ATTACK]
        }
        else if (HARVESER_IDS.length === 0) {
            this.creep_body = [MOVE, MOVE, CARRY, WORK]
        }
        else if (HARVESER_IDS.length < 2) {
            this.creep_body = [MOVE, MOVE, CARRY, CARRY, WORK, WORK]
        }
        else if (UPGRADER_IDS.length < 2) {
            this.creep_body = [MOVE, CARRY, WORK, WORK]
        }
        else if (BUILDER_IDS.length < 1 && CONSTRUCTION_SITE.length > 0) {
            this.creep_body = [MOVE, MOVE, CARRY, CARRY, WORK, WORK]
        }
        else if (REPAIRER_IDS.length < 2) {
            this.creep_body = [MOVE, MOVE, CARRY, CARRY, WORK, WORK]
        }
        else {
            this.creep_body = []
        }

        return this.creep_body
    }
}
