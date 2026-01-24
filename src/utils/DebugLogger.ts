import { Json } from "Consts"
import { ScreepFile } from "FileSystem/File"
import { FileSystem } from "FileSystem/FileSystem"
import { IsJsonType } from "./TypeChecks"


export class DebugLogger {
    private static debug_flag: boolean = true
    private static level: number = 1
    private static debug_file: string[] = ['debug', 'file']

    private static ReadFromFile<T>(file: ScreepFile, key: string, write_if_fail: T): T {
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

    public static InitLogger() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.debug_file)
        this.debug_flag = this.ReadFromFile(FILE, 'debug logs on?', this.debug_flag)
        this.level = this.ReadFromFile(FILE, 'log level', this.level)
    }

    public static Log(data: any, level: number = 1) {
        if (!this.debug_flag || level !== this.level) { return }
        console.log(data)
    }
}
