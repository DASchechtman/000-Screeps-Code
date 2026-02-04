import { ScreepFile, ScreepMetaFile } from "FileSystem/File"
import { FileSystem } from "FileSystem/FileSystem"
import { EntityBehavior, EntityTypes } from "./CreepBehaviors.ts/BehaviorTypes"
import { HarvesterBehavior } from "./CreepBehaviors.ts/HarvesterBehavior"
import { UpgraderBehavior } from "./CreepBehaviors.ts/UpgraderBehavior"
import { BuildBehavior } from "./CreepBehaviors.ts/BuildBehavior"
import { RepairBehavior } from "./CreepBehaviors.ts/RepairBehavior"
import { AttackBehavior } from "./CreepBehaviors.ts/AttackBehavior"
import { BEHAVIOR_KEY, ORIG_BEHAVIOR_KEY } from "Consts"
import { DebugLogger } from "utils/DebugLogger"
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs"
import { TowerBehavior } from "./CreepBehaviors.ts/TowerBehavior"
import { StructureSupplierBehavior } from "./CreepBehaviors.ts/StructureSupplierBehavior"


export class EntityObj {
    private id: string
    private file_path: string[]
    private file: ScreepFile | null
    private behavior: EntityBehavior | null
    private behavior_register: Array<EntityBehavior>

    constructor() {
        this.behavior_register = new Array<EntityBehavior>()
        this.behavior = null
        this.file = null
        this.file_path = []
        this.id = ""

        this.behavior_register[EntityTypes.HARVESTER_TYPE] = new HarvesterBehavior()
        this.behavior_register[EntityTypes.UPGRADER_TYPE] = new UpgraderBehavior()
        this.behavior_register[EntityTypes.BUILDER_TYPE] = new BuildBehavior()
        this.behavior_register[EntityTypes.REPAIR_TYPE] = new RepairBehavior()
        this.behavior_register[EntityTypes.ATTACK_TYPE] = new AttackBehavior()
        this.behavior_register[EntityTypes.TOWER_TYPE] = new TowerBehavior()
        this.behavior_register[EntityTypes.STRUCTURE_SUPPLIER_TYPE] = new StructureSupplierBehavior()
    }

    public OverrideCreep(id: string) {
        this.id = id

        this.file_path = ["entities", this.id]
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

        const NEXT_BEHAVIOR = this.behavior_register.at(creep_behavior)
        this.behavior = NEXT_BEHAVIOR ? NEXT_BEHAVIOR : null
    }

    public FullyOverrideCreep(id: string, behavior_type: number) {
        this.OverrideCreep(id)
        this.OverrideBehavior(behavior_type)
    }

    public Load(FailedToLoad: (id: string) => void) {

        if (this.file == null) { return }
        const CANT_LOAD = !Boolean(this.behavior?.Load(this.file, this.id))
        if (CANT_LOAD) {
            this.behavior?.Unload(this.file)
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
