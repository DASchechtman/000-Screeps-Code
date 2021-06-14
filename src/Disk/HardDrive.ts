export interface JsonObj {
    [item: string]: string | number | (string | number | boolean | null)[] | boolean | null | JsonObj
}

export class HardDrive {
    static Write(
        identifier: string,
        data: string |
            number |
            Array<string | number | boolean | null> |
            boolean |
            null |
            JsonObj
    ): void {
        let disk = JSON.parse(RawMemory.get())
        disk[identifier] = data
        RawMemory.set(JSON.stringify(disk))
    }

    static Read(identifier: string): string |
        number |
        Array<string | number | boolean | null> |
        boolean |
        null |
        JsonObj |
        undefined {
        const data = JSON.parse(RawMemory.get())[identifier]
        return data
    }

    static Erase(identifier: string): void {
        let disk = JSON.parse(RawMemory.get())
        delete disk[identifier]
        RawMemory.set(JSON.stringify(disk))
    }
}