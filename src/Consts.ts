import { ScreepFile, ScreepMetaFile } from "FileSystem/File"

export const BEHAVIOR_KEY = "behavior"
export const ORIG_BEHAVIOR_KEY = "original behavior"

export type BaseJsonValue = string | number | boolean | null
export type JsonArray = Array<BaseJsonValue | JsonObj | JsonArray>
export interface JsonObj { [key: string]: BaseJsonValue | JsonObj | JsonArray }
export type Json = BaseJsonValue | JsonObj | JsonArray
