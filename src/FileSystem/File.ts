import { BaseJsonValue, Json, JsonObj } from "Consts"

export const FILE_ENDING = ':sfl'
export const FOLDER_ENDING = ':sfldr'

export class ScreepFile {
    private WriteFileBehavior: ((key: string, val: any) => void)
    private ReadFileBehavior: ((key: string) => any | undefined)
    private FileName: () => string
    private MarkDelete: () => void

    constructor (write: (key: string, val: any) => void, read: (key: string) => any | undefined, file_name: () => string, mark_delete: () => void) {
        this.WriteFileBehavior = write
        this.ReadFileBehavior = read
        this.FileName = file_name
        this.MarkDelete = mark_delete
    }

    public WriteToFile(key: BaseJsonValue, value: Json) {
        key = String(key)
        this.WriteFileBehavior(key, value)
    }

    public WriteAllToFile(data: { key: BaseJsonValue, value: Json }[]) {
        for (let entry of data) {
            this.WriteFileBehavior(String(entry.key), entry.value)
        }
    }

    public ReadFromFile(key: BaseJsonValue): Json {
        key = String(key)

        const VAL = this.ReadFileBehavior(key)
        if (VAL === undefined) {
            throw new Error(`Accessing non-existent data "${key}" in file ${this.FileName()}`)
        }

        return VAL as Json
    }

    public MarkForDeletion() {
        this.MarkDelete()
    }
}
