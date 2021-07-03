import { STRUCTURE_TYPE } from "../Constants/GameObjectConsts";
import { GameObject } from "../GameObject";

type S<T extends StructureConstant> = Structure<T>

export class StructureWrapper<T extends StructureConstant> extends GameObject {

    protected m_Struct_id: Id<S<T>>
    protected m_Struct: Structure<T> | null
    protected m_Cur_health: number
    protected m_Max_health: number

    constructor(struct_id: string, type?: number) {
        if (typeof type === 'number') {
            super(struct_id, type)
        }
        else {
            super(struct_id, STRUCTURE_TYPE)
        }
        
        this.m_Struct_id = struct_id as Id<S<T>>
        this.m_Struct = Game.getObjectById(this.m_Struct_id)

        this.m_Cur_health = 0
        this.m_Max_health = 0

        if (this.m_Struct) {
            this.m_Cur_health = this.m_Struct.hits
            this.m_Max_health = this.m_Struct.hitsMax
        }
    }

    OnLoad(): void {

    }

    OnRun(): void {

    }

    OnSave(): void {

    }

    GetCurHealth(): number {
        return this.m_Cur_health
    }

    GetMaxHealth(): number {
        return this.m_Max_health
    }
}