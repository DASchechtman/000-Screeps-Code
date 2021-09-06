import { GameEntityTypes } from "../../consts/GameConstants"
import { StructureWrapper } from "./StructureWrapper"

export class DegradableStructureWrapper<T extends StructureConstant> extends StructureWrapper<T> {
    constructor(struct: Id<Structure<T>>) {
        super(struct, GameEntityTypes.DEGRADABLE_STRUCT)
    }
}