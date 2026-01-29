import { ScreepFile, ScreepMetaFile } from "FileSystem/File"
import { FileSystem } from "FileSystem/FileSystem"
import { ATTACK_TYPE, BUILDER_TYPE, HARVESTER_TYPE, REPAIR_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes"
import { HarvesterBehavior } from "./CreepBehaviors.ts/HarvesterBehavior"
import { UpgraderBehavior } from "./CreepBehaviors.ts/UpgraderBehavior"
import { BuildBehavior } from "./CreepBehaviors.ts/BuildBehavior"
import { RepairBehavior } from "./CreepBehaviors.ts/RepairBehavior"
import { AttackBehavior } from "./CreepBehaviors.ts/AttackBehavior"
import { BEHAVIOR_KEY, CreepBehavior, ORIG_BEHAVIOR_KEY } from "Consts"
import { DebugLogger } from "utils/DebugLogger"
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs"



export class CreepObj {
    private id: string
    private file_path: string[]
    private file: ScreepFile | null
    private behavior: CreepBehavior | null

    private harvest_behavior: HarvesterBehavior
    private upgrade_behavior: UpgraderBehavior
    private build_behavior: BuildBehavior
    private repair_behavior: RepairBehavior
    private gaurd_behavior: AttackBehavior

    constructor() {
        this.harvest_behavior = new HarvesterBehavior()
        this.upgrade_behavior = new UpgraderBehavior()
        this.build_behavior = new BuildBehavior()
        this.repair_behavior = new RepairBehavior()
        this.gaurd_behavior = new AttackBehavior()
        this.behavior = null
        this.file = null
        this.file_path = []
        this.id = ""
    }

    public OverrideCreep(id: string) {
        this.id = id

        this.file_path = ["creeps", this.id]
        this.file = FileSystem.GetFileSystem().GetFile(this.file_path)

        this.behavior = null
    }

    public OverrideBehavior(behavior_type: number) {
        if (this.file == null) { return }
        let creep_behavior = SafeReadFromFileWithOverwrite(this.file, BEHAVIOR_KEY, behavior_type)
        let creep_orig_behavior = SafeReadFromFileWithOverwrite(this.file, ORIG_BEHAVIOR_KEY, behavior_type)

        if (creep_orig_behavior !== behavior_type) {
            creep_behavior = behavior_type
            creep_orig_behavior = behavior_type
            this.file?.WriteToFile(BEHAVIOR_KEY, creep_behavior)
            this.file?.WriteToFile(ORIG_BEHAVIOR_KEY, creep_orig_behavior)
        }

        if (creep_behavior === HARVESTER_TYPE) {
            this.behavior = this.harvest_behavior
        }
        else if (creep_behavior === UPGRADER_TYPE) {
            this.behavior = this.upgrade_behavior
        }
        else if (creep_behavior === BUILDER_TYPE) {
            this.behavior = this.build_behavior
        }
        else if (creep_behavior === REPAIR_TYPE) {
            this.behavior = this.repair_behavior
        }
        else if (creep_behavior === ATTACK_TYPE) {
            this.behavior = this.gaurd_behavior
        }
    }

    public FullyOverrideCreep(id: string, behavior_type: number) {
        this.OverrideCreep(id)
        this.OverrideBehavior(behavior_type)
    }

    public Load(FailedToLoad: (id: string) => void) {
        if (this.file == null) { return }
        const CANT_LOAD = !Boolean(this.behavior?.Load(this.file, this.id))
        if (CANT_LOAD) {
            FailedToLoad(this.id)
            this.behavior = null
            this.file.MarkForDeletion()
        }
    }

    public Run() {
        this.behavior?.Run()
    }

    public Cleanup() {
        if (this.file == null) { return }
        this.behavior?.Cleanup(this.file)
    }
}
