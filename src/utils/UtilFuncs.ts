import { ScreepFile, ScreepMetaFile } from "FileSystem/File"
import { IsJsonType } from "./TypeChecks"
import { BaseJsonValue, Json } from "Consts"
import { FileSystem } from "FileSystem/FileSystem"
import { RoomData } from "Rooms/RoomData"

export function SafeReadFromFileWithOverwrite<T extends Json>(file_path: string[] | ScreepFile, key: BaseJsonValue, write_if_fail: T) {
    if (!Array.isArray(file_path)) {
        file_path = file_path.GetFilePath();
    }
    
    let file = FileSystem.GetFileSystem().GetFile(file_path)
    let ret_val = file.ReadFromFile(key)

    if (ret_val === undefined) {
        ret_val = write_if_fail
        file.WriteToFile(key, ret_val)
    }

    return ret_val as T
}

export function SafeReadFromFile(file_path: string[], key: BaseJsonValue) {
    let file = FileSystem.GetFileSystem().GetExistingFile(file_path)
    if (file == null) { return undefined }

    let ret_val: Json | undefined = file.ReadFromFile(key)
    if (ret_val === undefined) { ret_val = undefined }

    return ret_val
}

export function SafeWriteToFile(file_path: string[], key: BaseJsonValue, val: Json) {
    let file = FileSystem.GetFileSystem().GetFile(file_path)
    file.WriteToFile(key, val)
}


