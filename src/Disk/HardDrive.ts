import { JsonObj } from "../CompilerTyping/Interfaces"

export class HardDrive {
    private static disk_data: any | null = null

    private static LoadData(): any {
        if (HardDrive.disk_data === null) {
            try {
                HardDrive.disk_data = JSON.parse(RawMemory.get())
            }
            catch {
                HardDrive.disk_data = {}
            }
        }
        return HardDrive.disk_data
    }

    static Write(identifier: string, data: JsonObj): void {
        let disk = this.LoadData()
        disk[identifier] = data
    }

    static Read(identifier: string): JsonObj {
        let data: JsonObj = this.LoadData()[identifier]
        if (!data) {
            data = {}
        }
        return data
    }

    static Erase(identifier: string): void {
        let disk = this.LoadData()
        delete disk[identifier]
    }

    static CommitChanges(): void {
        if (HardDrive.disk_data !== null) {
            RawMemory.set(JSON.stringify(HardDrive.disk_data))
        }
    }
}