import { ScreepFile } from "FileSystem/File"
import { IsJsonType } from "./TypeChecks"
import { BaseJsonValue } from "Consts"

export function SafelyReadFromFile<T>(file: ScreepFile, key: BaseJsonValue, write_if_fail: T) {
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

