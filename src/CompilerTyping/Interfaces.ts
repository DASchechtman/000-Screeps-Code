import { Stack } from "../DataStructures/Stack";
import { GameObject } from "../GameObject";
import { StructureWrapper } from "../Structure/StructureWrapper";
import { Filter, JsonType, Method } from "./Types";

export interface StructStackIndex {
    index: number,
    timed_defense_index: number
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

export interface HtmlElement {
    open_tag: string,
    close_tag: string,
    body: HtmlElement[] | null,
    text?: string
}

export interface Point {
    x: number,
    y: number
}

export interface GridNode {
    F: number,
    G: number,
    H: number,
    pos: Point,
    dir?: DirectionConstant
    child?: GridNode,
    parent?: GridNode
}

export interface GridNodePoint {
    point: Point, 
    dir: DirectionConstant
}

export interface LinkedListNode<T> {
    index: number
    val?: T,
    next?: LinkedListNode<T>,
    prev?: LinkedListNode<T>
}

export interface GridNodeData{
    node: GridNode,
    has_road: boolean,
    is_walkable: boolean,
    creep_on_tile?: boolean
}

export interface SignalMember {
    member: SignalReciever,
    receive_count: number
}