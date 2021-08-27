import { GameEntityTypes } from "../consts/GameConstants";
import { StructureWrapper } from "./StructureWrapper";

export class BehaviorStructureWrapper<T extends StructureConstant> extends StructureWrapper<T> {
    constructor(struct: Id<Structure<T>>) {
        super(struct, GameEntityTypes.BEHAVIOR_STRUCT)
    }

    OnRun(): void {
        super.OnRun()
    }
}