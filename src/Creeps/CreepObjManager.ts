import { ScreepFile } from "FileSystem/File";
import { CreepObj } from "./Creep";
import { HARVESTER_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes";
import { FileSystem } from "FileSystem/FileSystem";

export class CreepObjectManager {
    private static manager: CreepObjectManager | null = null

    public static GetCreepManager() {
        if (this.manager === null) { this.manager = new CreepObjectManager() }
        return this.manager
    }

    private creep_pool: Array<CreepObj>
    private available_creeps: Map<CreepObj, number>
    private reserved_creeps: Map<CreepObj, number>
    private file_path: string[]

    private constructor() {
        this.creep_pool = []
        this.available_creeps = new Map()
        this.reserved_creeps = new Map()
        this.file_path = ['creeps', 'info']

        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        FILE.WriteToFile(HARVESTER_TYPE, [])
        FILE.WriteToFile(UPGRADER_TYPE, [])
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

        file.WriteToFile(behavior, id_arr)
    }

    public RunAllActiveCreeps() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const HARVESTER_IDS = FILE.ReadFromFile(HARVESTER_TYPE) as string[]
        const UPGRADER_IDS = FILE.ReadFromFile(UPGRADER_TYPE) as string[]

        this.RunCreepCode(HARVESTER_TYPE, HARVESTER_IDS, FILE)
        this.RunCreepCode(UPGRADER_TYPE, UPGRADER_IDS, FILE)
    }

    public AddCreepId(id: string) {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const HARVESTER_IDS = FILE.ReadFromFile(HARVESTER_TYPE) as string[]
        const UPGRADER_IDS = FILE.ReadFromFile(UPGRADER_TYPE) as string[]

        const IS_CREEP_ID_ALREADY_STORED = (
            HARVESTER_IDS.includes(id)
            || UPGRADER_IDS.includes(id)
        )
        if (IS_CREEP_ID_ALREADY_STORED) { return }

        if (HARVESTER_IDS.length < 2) { HARVESTER_IDS.push(id) }
        else if (UPGRADER_IDS.length < 1) { UPGRADER_IDS.push(id) }

        FILE.WriteToFile(HARVESTER_TYPE, HARVESTER_IDS)
        FILE.WriteToFile(UPGRADER_TYPE, UPGRADER_IDS)
    }
}
