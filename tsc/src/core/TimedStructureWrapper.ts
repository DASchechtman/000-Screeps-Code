import { GameEntityTypes } from "../consts/GameConstants"
import { StructureWrapper } from "./StructureWrapper"

export class TimedStructureWrapper<T extends StructureConstant> extends StructureWrapper<T> {
    constructor(struct: Id<Structure<T>>) {
        super(struct)
    }
}