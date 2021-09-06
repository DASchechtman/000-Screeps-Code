import { GameEntityTypes } from "../consts/GameConstants";
import { ColonyMember } from "../core/ColonyMember";
import { StructureWrapper } from "../core/structure/StructureWrapper";
import { Queue } from "../utils/datastructures/Queue";
import { Filter, JsonType, Method } from "./Types";

export interface StructStackIndex {
    index: number,
    timed_defense_index: number
    array: StructureWrapper<any>[]
}

export interface CreepType {
    creep_type: number,
    creep_name: string
}

export interface CreepTypeCollection {
    level: number,
    count: number,
    collection: Map<number, CreepType[]>
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
    from: ColonyMember,
    data: JsonObj,
    filter: Filter
    method?: Method
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

export interface SignalMessage {
    data: unknown,
    sender: ColonyMember,
    receiver_type?: GameEntityTypes,
    reciever_name?: string
}