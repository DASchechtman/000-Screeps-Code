import { ScreepFile } from "FileSystem/File"

export type EntityBehaviorType = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const HARVESTER_TYPE: EntityBehaviorType = 0
export const UPGRADER_TYPE: EntityBehaviorType = 1
export const BUILDER_TYPE: EntityBehaviorType = 2
export const REPAIR_TYPE: EntityBehaviorType = 3
export const ATTACK_TYPE: EntityBehaviorType = 4
export const TOWER_TYPE: EntityBehaviorType = 5
export const STRUCTURE_SUPPLIER_TYPE: EntityBehaviorType = 6

export interface EntityBehavior {
    Load: (file: ScreepFile, id: string) => boolean
    Run: () => void
    Cleanup: (file: ScreepFile) => void
    Unload: (file: ScreepFile) => void
}

export interface EntityState {
    GetNextState: () => EntityState
    RunState: () => boolean
}

export class EntityStateManager {
    private cur_state: EntityState

    constructor(initial_state: EntityState) {
        this.cur_state = initial_state
    }

    RunState(): boolean {
        return this.cur_state.RunState()
    }

    GetNextState() {
        this.cur_state = this.cur_state.GetNextState()
    }
}
