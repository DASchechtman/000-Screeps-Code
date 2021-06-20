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