import { BaseJsonValue, Json, JsonObj } from "Consts"

export const FILE_ENDING = ':sfl'
export const FOLDER_ENDING = ':sfldr'

export interface ScreepFile {
    WriteToFile: (key: BaseJsonValue, value: Json) => void
    WriteAllToFile: (data: { key: BaseJsonValue, value: Json }[]) => void
    ReadFromFile: (key: BaseJsonValue) => Json | undefined
    MarkForDeletion: () => void
}

export class ScreepMetaFile {
    private tick_last_accessed: number = -1
    private file_name: string = ""
    private path: string[] = []
    private can_delete: boolean = false
    private SaveFileBehavior: ((key: string, val: Json) => void) = () => { }
    private ReadFileBehavior: ((key: string) => Json | undefined) = () => undefined

    private hasProp(obj: unknown, key: string): obj is Record<string, unknown> {
        return typeof obj === 'object' && obj !== null && key in obj
    }

    public OverwriteFile(prev_file_contents: ScreepMetaFile | unknown) {
        if (prev_file_contents instanceof ScreepMetaFile) {
            this.tick_last_accessed = prev_file_contents.tick_last_accessed
            this.file_name = prev_file_contents.file_name
            this.path = prev_file_contents.path
            return
        }

        if (this.hasProp(prev_file_contents, 'tick_last_accessed') && typeof prev_file_contents.tick_last_accessed === 'number') {
            this.tick_last_accessed = prev_file_contents.tick_last_accessed
        }
        else {
            this.tick_last_accessed = -1
        }

        if (this.hasProp(prev_file_contents, 'file_name') && typeof prev_file_contents.file_name === 'string') {
            this.file_name = prev_file_contents.file_name
        }

        if (this.hasProp(prev_file_contents, 'path') && Array.isArray(prev_file_contents.path) && prev_file_contents.path.every(s => typeof s === 'string')) {
            this.path = prev_file_contents.path
        }
    }

    public UpdateAccessFunctions(write: (key: string, val: any) => void, read: (key: string) => any | undefined) {
        this.SaveFileBehavior = write
        this.ReadFileBehavior = read
    }

    public ShouldDeleteFile() {
        return this.tick_last_accessed === -1 || Game.time - this.tick_last_accessed >= 50
    }

    public UpdateLastAccessed() {
        this.tick_last_accessed = Game.time
    }

    public GetPath() {
        return this.path
    }

    public ToJson() {
        let json: any = {
            tick_last_accessed: this.tick_last_accessed,
            path: this.path,
            file_name: this.file_name
        }

        if (this.can_delete) { json.can_delete = true }

        return json
    }

    public MarkForDeletion() {
        this.SaveFileBehavior('can_delete', this.can_delete)
    }

    public WriteToFile(key: BaseJsonValue, value: Json) {
        key = String(key)
        this.SaveFileBehavior(key, value)
    }

    public WriteAllToFile(data: { key: BaseJsonValue, value: Json }[]) {
        for (let entry of data) {
            this.SaveFileBehavior(String(entry.key), entry.value)
        }
    }

    public ReadFromFile(key: BaseJsonValue): Json | undefined {
        key = String(key)

        const VAL = this.ReadFileBehavior(key)
        if (VAL === undefined) {
            return undefined
        }

        return VAL
    }
}
