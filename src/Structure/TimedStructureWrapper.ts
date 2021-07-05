import { TIMED_STRUCTURE_TYPE } from "../Constants/GameObjectConsts";
import { StructureWrapper } from "./StructureWrapper";

export class TimedStructureWrapper<T extends StructureConstant> extends StructureWrapper<T> {

    constructor(struct_id: string) {
        super(struct_id, TIMED_STRUCTURE_TYPE)
        const x = this.m_Cur_health
    }
}