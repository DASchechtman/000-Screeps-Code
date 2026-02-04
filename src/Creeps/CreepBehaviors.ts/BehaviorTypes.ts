import { ScreepFile } from "FileSystem/File"

export enum EntityTypes {
    HARVESTER_TYPE,
    UPGRADER_TYPE,
    BUILDER_TYPE,
    REPAIR_TYPE,
    ATTACK_TYPE,
    TOWER_TYPE,
    STRUCTURE_SUPPLIER_TYPE,
}

export interface EntityBehavior {
    Load: (file: ScreepFile, id: string) => boolean
    Run: () => void
    Cleanup: (file: ScreepFile) => void
    Unload: (file: ScreepFile) => void
}

export interface EntityState {
    GetNextState: () => EntityState
    RunState: (file: ScreepFile) => boolean
}

export class EntityStateManager {
    private cur_state: EntityState

    constructor(initial_state: EntityState) {
        this.cur_state = initial_state
    }

    RunState(file: ScreepFile): boolean {
        return this.cur_state.RunState(file)
    }

    GetNextState() {
        this.cur_state = this.cur_state.GetNextState()
    }
}
