import { ScreepFile, ScreepMetaFile } from "FileSystem/File"
import { IsJsonType } from "./TypeChecks"
import { BaseJsonValue } from "Consts"

export function SafeReadFromFileWithOverwrite<T>(file: ScreepFile, key: BaseJsonValue, write_if_fail: T) {
    try {
        return file.ReadFromFile(key) as T
    }
    catch {
        if (IsJsonType(write_if_fail)) {
            file.WriteToFile(key, write_if_fail)
        }
        return write_if_fail
    }
}

export function SafeReadFromFile(file: ScreepFile, key: BaseJsonValue) {
    try {
        return file.ReadFromFile(key)
    }
    catch {
        return undefined
    }
}

