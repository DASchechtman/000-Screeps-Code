import exp from "constants"
import { GameObject } from "../GameObject"
import { Signal } from "./Interfaces"


export type Container = (
    StructureSpawn
    | StructureExtension
)

export type Filter = (sender: Signal, other: GameObject) => boolean

export type JsonType = (
    string 
    | number 
    | Array<string | number | boolean | null>
    | boolean 
    | null 
)

export type Method = Filter

export type RoomPosObj = {pos: RoomPosition}

export type RoomPos = RoomPosition | RoomPosObj