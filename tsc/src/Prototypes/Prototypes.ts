import { Point } from "../types/Interfaces"
import { ExtendedRoomPosition } from "./Extended/ExtendedRoomPosition"
import { ExtendedSpawn } from "./Extended/ExtendedSpawn"
import { ExtendedStructure } from "./Extended/ExtendedStructure"

function AddProperty(base_obj: any, prop_name: string, prop: any) {
    const is_constructor = prop_name === "constructor"
    const override = base_obj.prototype[prop_name]?.toString() !== prop?.toString()
    if (override) {
        base_obj.prototype[prop_name] = prop
    }
    else {
        console.log("property already exists")
    }
}

function AddAllProperties(base_obj: any, extended_obj: any): void {
    const extended_proto = extended_obj.prototype
    const p = Object.getOwnPropertyNames(extended_proto)
    for(let p_name of p) {
        const func = extended_proto[p_name]
        AddProperty(base_obj, p_name, func)
    }
}

declare global {
    interface RoomPosition {
        ToPoint(): Point,
    }

    interface Structure {
        Get<T extends StructureConstant>(id: Id<Structure<T>>): Structure<T> | null 
        CurHealth(): number,
        MaxHealth(): number,
        RunBehavior(...args:unknown[]): number
    }
}

export function ExtendProperties() {
    AddAllProperties(RoomPosition, ExtendedRoomPosition)
    AddAllProperties(Structure, ExtendedStructure)
}


