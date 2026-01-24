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
    private data_key: string

    private constructor() {
        this.creep_pool = []
        this.available_creeps = new Map()
        this.reserved_creeps = new Map()
        this.file_path = ['creeps', 'info']
        this.data_key = 'role'

        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        FILE.WriteToFile(this.data_key, [[], []])
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

    private RunCreepCode(behavior: number, id_arr: string[]) {
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
    }

    public RunAllActiveCreeps() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const ROLE_IDS = FILE.ReadFromFile(this.data_key) as string[][]

        this.RunCreepCode(HARVESTER_TYPE, ROLE_IDS[HARVESTER_TYPE])
        this.RunCreepCode(UPGRADER_TYPE, ROLE_IDS[UPGRADER_TYPE])

        FILE.WriteToFile(this.data_key, ROLE_IDS)
    }

    public AddCreepId(id: string) {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const ROLE_IDS = FILE.ReadFromFile(this.data_key) as string[][]

        if (ROLE_IDS.some(id_arr => id_arr.includes(id))) {
            return
        }

        if (ROLE_IDS[HARVESTER_TYPE].length < 2) {
            ROLE_IDS[HARVESTER_TYPE].push(id)
        }
        else if (ROLE_IDS[UPGRADER_TYPE].length < 2) {
            ROLE_IDS[UPGRADER_TYPE].push(id)
        }

        FILE.WriteToFile(this.data_key, ROLE_IDS)
    }

    public HasSpawnedEnoughCreeps() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.file_path)
        const ROLE_IDS = FILE.ReadFromFile(this.data_key) as string[][]

        let total = ROLE_IDS.reduce((prev, arr) => prev + arr.length, 0)
        return total >= 4
    }
}
