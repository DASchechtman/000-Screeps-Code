import { Stack } from "../DataStructures/Stack";
import { GameObject } from "../GameObject";
import { Filter, JsonType, Method } from "./Types";

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
}