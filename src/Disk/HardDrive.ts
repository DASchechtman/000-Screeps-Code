type JsonType = (
    string 
    | number 
    | Array<string | number | boolean | null>
    | boolean 
    | null 
    | JsonObj
)

export interface JsonObj {
    [item: string]: JsonType
}

export class HardDrive {
    static Write(identifier: string, data: JsonType): void {
        let disk = JSON.parse(RawMemory.get())
        disk[identifier] = data
        RawMemory.set(JSON.stringify(disk))
    }

    static Read(identifier: string): JsonType | undefined {
        const data = JSON.parse(RawMemory.get())[identifier]
        return data
    }

    static Erase(identifier: string): void {
        let disk = JSON.parse(RawMemory.get())
        delete disk[identifier]
        RawMemory.set(JSON.stringify(disk))
    }
}