import { JsonObj } from "../CompilerTyping/Interfaces"

export class HardDrive {
    private static disk_data: any | null = null
    static Write(identifier: string, data: JsonObj): void {
        let disk = JSON.parse(RawMemory.get())
        disk[identifier] = data
        RawMemory.set(JSON.stringify(disk))
    }

    static Read(identifier: string): JsonObj {
        let data: JsonObj = JSON.parse(RawMemory.get())[identifier]
        if (!data) {
            data = {}
        }
        return data
    }

    static Erase(identifier: string): void {
        let disk = JSON.parse(RawMemory.get())
        delete disk[identifier]
        RawMemory.set(JSON.stringify(disk))
    }
}