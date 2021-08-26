import { GameEntityTypes } from "../consts/GameConstants";
import { StructureWrapper } from "./StructureWrapper";

export class BehaviorStructureWrapper<T extends StructureConstant> extends StructureWrapper<T> {
    constructor(struct: Id<Structure<T>>) {
        super(struct)
    }

    OnRun(): void {
        throw new Error("not implemented yet")
    }
}