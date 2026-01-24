import { ScreepFile } from "FileSystem/File"
import { FileSystem } from "FileSystem/FileSystem"
import { ATTACK_TYPE, BUILDER_TYPE, HARVESTER_TYPE, REPAIR_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes"
import { HarvesterBehavior } from "./CreepBehaviors.ts/HarvesterBehavior"
import { UpgraderBehavior } from "./CreepBehaviors.ts/UpgraderBehavior"
import { BuildBehavior } from "./CreepBehaviors.ts/BuildBehavior"
import { RepairBehavior } from "./CreepBehaviors.ts/RepairBehavior"
import { AttackBehavior } from "./CreepBehaviors.ts/AttackBehavior"
import { BEHAVIOR_KEY, ORIG_BEHAVIOR_KEY } from "Consts"
import { DebugLogger } from "utils/DebugLogger"

export interface CreepBehavior {
    Load: (file: ScreepFile) => boolean
    Run: () => void
    Cleanup: (file: ScreepFile) => void
}

export class CreepObj {
    private id: string = ""
    private file_path: string[] = []
    private file: ScreepFile | null = null
    private behavior: CreepBehavior | null = null

    public OverrideCreep(id: string) {
        this.id = id
        this.file_path = ["creeps", this.id]
        this.file = FileSystem.GetFileSystem().GetFile(this.file_path)
        this.behavior = null
    }

    public OverrideBehavior(behavior_type: number) {
        let creep_behavior = -1
        let creep_orig_behavior = -1

        try {
            creep_behavior = Number(this.file?.ReadFromFile(BEHAVIOR_KEY))
            creep_orig_behavior = Number(this.file?.ReadFromFile(ORIG_BEHAVIOR_KEY))

            if (creep_orig_behavior !== behavior_type) {
                creep_behavior = behavior_type
                creep_orig_behavior = behavior_type
                this.file?.WriteToFile(BEHAVIOR_KEY, creep_behavior)
                this.file?.WriteToFile(ORIG_BEHAVIOR_KEY, creep_orig_behavior)
            }
        }
        catch (e) {
            DebugLogger.Log(`Creep Error: ${e}`)
            this.file?.WriteToFile(BEHAVIOR_KEY, behavior_type)
            this.file?.WriteToFile(ORIG_BEHAVIOR_KEY, behavior_type)
            creep_behavior = behavior_type
        }

        if (creep_behavior === HARVESTER_TYPE) {
            this.behavior = new HarvesterBehavior(this.id)
        }
        else if (creep_behavior === UPGRADER_TYPE) {
            this.behavior = new UpgraderBehavior(this.id)
        }
        else if (creep_behavior === BUILDER_TYPE) {
            this.behavior = new BuildBehavior(this.id)
        }
        else if (creep_behavior === REPAIR_TYPE) {
            this.behavior = new RepairBehavior(this.id)
        }
        else if (creep_behavior === ATTACK_TYPE) {
            this.behavior = new AttackBehavior(this.id)
        }
    }

    public Load(FailedToLoad: () => void) {
        if (this.file == null) { return }
        const CANT_LOAD = !Boolean(this.behavior?.Load(this.file))
        if (CANT_LOAD) {
            FailedToLoad()
            this.behavior = null
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
