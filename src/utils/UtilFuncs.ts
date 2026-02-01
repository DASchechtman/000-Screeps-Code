import { ScreepFile, ScreepMetaFile } from "FileSystem/File"
import { IsJsonType } from "./TypeChecks"
import { BaseJsonValue, Json } from "Consts"

export function SafeReadFromFileWithOverwrite<T extends Json>(file: ScreepFile, key: BaseJsonValue, write_if_fail: T) {
    let ret_val = file.ReadFromFile(key)
    if (ret_val == null) {
        ret_val = write_if_fail
        file.WriteToFile(key, ret_val)
    }

    return write_if_fail
}

export function SafeReadFromFile(file: ScreepFile, key: BaseJsonValue) {
    let ret_val = file.ReadFromFile(key)
    if (ret_val == null) {
        return undefined
    }

    return ret_val
}

