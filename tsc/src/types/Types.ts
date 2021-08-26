import { ColonyMember } from "../core/ColonyMember"
import { JsonObj, Signal } from "./Interfaces"


export type Container = (
    StructureSpawn
    | StructureExtension
    | StructureTower
)

export type Filter = (sender: Signal, other: ColonyMember) => boolean

export type JsonList = (string | number | boolean | JsonObj | null | JsonList)[]

export type JsonType = (
    string 
    | number 
    | JsonList
    | boolean 
    | null 
)

export type Method = Filter

export type RoomPosObj = {pos: RoomPosition}

export type RoomPos = RoomPosition | RoomPosObj

export type ColonyMemberKey = number | string