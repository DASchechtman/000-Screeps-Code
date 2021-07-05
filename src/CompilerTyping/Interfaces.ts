import { Stack } from "../DataStructures/Stack";
import { GameObject } from "../GameObject";
import { StructureWrapper } from "../Structure/StructureWrapper";
import { Filter, JsonType, Method } from "./Types";

export interface StructStackIndex {
    index: number,
    array: Array<StructureWrapper<any>>
}

export interface CreepType {
    creep_type: number,
    creep_name: string
}

export interface CreepTypeCollection {
    level: number,
    count: number,
    collection: Map<number, Array<CreepType>>
}

export interface JsonObj {
    [item: string]: JsonType | JsonObj
}

export interface LevelIndexArray {
    '0': number;
    '1': number;
    '2': number;
}

export interface Signal {
    from: GameObject,
    data: JsonObj,
    filter: Filter
    method?: Method
}

export interface SignalReciever {
    reciever: GameObject
    signals: Stack<Signal>
    max_signals: number
}