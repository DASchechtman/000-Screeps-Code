import { ScreepFile, ScreepMetaFile } from "FileSystem/File"

export const BEHAVIOR_KEY = "behavior"
export const ORIG_BEHAVIOR_KEY = "original behavior"

export type BaseJsonValue = string | number | boolean | null
export type JsonArray = Array<Json>
export interface JsonObj { [key: string]: Json }
export type Json = BaseJsonValue | JsonObj | JsonArray

export const TEST = <const>['test1', 'test2']
export type TestType = typeof TEST[number]

export const OwnedStructuresTypes = <const> [
    STRUCTURE_SPAWN
    ,STRUCTURE_EXTENSION
    ,STRUCTURE_RAMPART
    ,STRUCTURE_CONTROLLER
    ,STRUCTURE_LINK
    ,STRUCTURE_STORAGE
    ,STRUCTURE_TOWER
    ,STRUCTURE_OBSERVER
    ,STRUCTURE_POWER_BANK
    ,STRUCTURE_POWER_SPAWN
    ,STRUCTURE_EXTRACTOR
    ,STRUCTURE_LAB
    ,STRUCTURE_TERMINAL
    ,STRUCTURE_NUKER
    ,STRUCTURE_FACTORY
]

export type OwnedStructuresConstant = typeof OwnedStructuresTypes[number]

export interface FindStructureType {
    [key: string]:
    | StructureSpawn
    | StructureExtension
    | StructureRoad
    | StructureRampart
    | StructureKeeperLair
    | StructurePortal
    | StructureController
    | StructureLink
    | StructureStorage
    | StructureTower
    | StructureObserver
    | StructurePowerBank
    | StructurePowerSpawn
    | StructureExtractor
    | StructureLab
    | StructureTerminal
    | StructureContainer
    | StructureNuker
    | StructureFactory
    | StructureInvaderCore
    | StructureWall

    "spawn": StructureSpawn
    "extension": StructureExtension
    "road": StructureRoad
    "rampart": StructureRampart
    "keeperLair": StructureKeeperLair
    "portal": StructurePortal
    "controller": StructureController
    "link": StructureLink
    "storage": StructureStorage
    "tower": StructureTower
    "observer": StructureObserver
    "powerBank": StructurePowerBank
    "powerSpawn": StructurePowerSpawn
    "extractor": StructureExtractor
    "lab": StructureLab
    "terminal": StructureTerminal
    "container": StructureContainer
    "nuker": StructureNuker
    "factory": StructureFactory
    "invaderCore": StructureInvaderCore
    "constructedWall": StructureWall
}

export interface FindOwnedStructureType {
    [key: string]:
    | StructureSpawn
    | StructureExtension
    | StructureRampart
    | StructureController
    | StructureLink
    | StructureStorage
    | StructureTower
    | StructureObserver
    | StructurePowerBank
    | StructurePowerSpawn
    | StructureExtractor
    | StructureLab
    | StructureTerminal
    | StructureNuker
    | StructureFactory

    "spawn": StructureSpawn
    "extension": StructureExtension
    "rampart": StructureRampart
    "controller": StructureController
    "link": StructureLink
    "storage": StructureStorage
    "tower": StructureTower
    "observer": StructureObserver
    "powerBank": StructurePowerBank
    "powerSpawn": StructurePowerSpawn
    "extractor": StructureExtractor
    "lab": StructureLab
    "terminal": StructureTerminal
    "nuker": StructureNuker
    "factory": StructureFactory
}
