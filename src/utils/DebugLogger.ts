import { FileSystem } from "FileSystem/FileSystem"

export class DebugLogger {
    private static debug_flag: boolean
    private static level: number

    public static InitLogger() {
        const FILE = FileSystem.GetFileSystem().GetExistingFile(['debug', 'file'])
        
        if (FILE == null) {
            this.debug_flag = true
            this.level = 1
        }
        else {
            try {
                this.debug_flag = FILE.ReadFromFile('debug logs on?') as boolean
            } catch {}

            try {
                this.level = FILE.ReadFromFile('log level') as number
            } catch {
                this.level = 1
                FILE.WriteToFile('log level', this.level)
            }
        }
    }

    public static Log(data: any, level: number = 1) {
        if (!this.debug_flag || level !== this.level) { return }
        console.log(data)
    }
}
