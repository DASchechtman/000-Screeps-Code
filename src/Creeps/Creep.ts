import { ScreepFile } from "FileSystem/File"
import { FileSystem } from "FileSystem/FileSystem"
import { HARVESTER_TYPE, UPGRADER_TYPE } from "./CreepBehaviors.ts/BehaviorTypes"
import { HarvesterBehavior } from "./CreepBehaviors.ts/HarvesterBehavior"
import { UpgraderBehavior } from "./CreepBehaviors.ts/UpgraderBehavior"

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
        let behavior_key = "behavior"
        try {
            creep_behavior = Number(this.file?.ReadFromFile(behavior_key))
        }
        catch (e) {
            console.log(`Creep Error: ${e}`)
            this.file?.WriteToFile(behavior_key, behavior_type)
            creep_behavior = behavior_type
        }

        if (creep_behavior === HARVESTER_TYPE) {
            this.behavior = new HarvesterBehavior(this.id)
        }
        else if (creep_behavior === UPGRADER_TYPE) {
            this.behavior = new UpgraderBehavior(this.id)
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
