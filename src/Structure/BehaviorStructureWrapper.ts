import { BEHAVIOR_STRUCTURE_TYPE } from "../Constants/GameObjectConsts";
import { StructureWrapper } from "./StructureWrapper";

export class BehaviorStructureWrapper<T extends StructureConstant> extends StructureWrapper<T> {

    constructor(struct_id: string) {
        super(struct_id, BEHAVIOR_STRUCTURE_TYPE)
        const r = this.m_Struct?.room.name
    }

    OnLoad(): void {

    }

    OnRun(): void {

    }

    OnSave(): void {
        
    }
}