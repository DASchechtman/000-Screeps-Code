import { Json } from "Consts"
import { ScreepFile, ScreepMetaFile } from "FileSystem/File"
import { FileSystem } from "FileSystem/FileSystem"
import { IsJsonType } from "./TypeChecks"
import { SafeReadFromFile, SafeReadFromFileWithOverwrite } from "./UtilFuncs"


export class DebugLogger {
    private static debug_flag: boolean = true
    private static level: number = 1
    private static debug_file: string[] = ['debug', 'file']


    public static InitLogger() {
        const FILE = FileSystem.GetFileSystem().GetFile(this.debug_file)
        this.debug_flag = SafeReadFromFileWithOverwrite(FILE, 'debug logs on?', this.debug_flag)
        this.level = SafeReadFromFileWithOverwrite(FILE, 'log level', this.level)
    }

    public static Log(data: any, level: number = 1) {
        if (!this.debug_flag || level !== this.level) { return }
        console.log(data)
    }
}
