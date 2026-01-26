import { BaseJsonValue, Json, JsonObj } from "Consts"

export const FILE_ENDING = ':sfl'
export const FOLDER_ENDING = ':sfldr'

export class ScreepFile {
    private tick_last_accessed: number = -1
    private file_name: string = ""
    private path: string[] = []
    private data: JsonObj = {}
    private can_delete: boolean = false
    private SaveToMemory: ((file: ScreepFile) => void) = (file: ScreepFile) => {}

    private hasProp(obj: unknown, key: string): obj is Record<string, unknown> {
        return typeof obj === 'object' && obj !== null && key in obj
    }

    public OverwriteFile(prev_file_contents: ScreepFile | unknown) {
        if (prev_file_contents instanceof ScreepFile) {
            this.tick_last_accessed = prev_file_contents.tick_last_accessed
            this.file_name = prev_file_contents.file_name
            this.path = prev_file_contents.path
            this.data = prev_file_contents.data
            return
        }

        if (this.hasProp(prev_file_contents, 'tick_last_accessed') && typeof prev_file_contents.tick_last_accessed === 'number') {
            this.tick_last_accessed = prev_file_contents.tick_last_accessed
        }

        if (this.hasProp(prev_file_contents, 'file_name') && typeof prev_file_contents.file_name === 'string') {
            this.file_name = prev_file_contents.file_name
        }

        if (this.hasProp(prev_file_contents, 'path') && Array.isArray(prev_file_contents.path) && prev_file_contents.path.every(s => typeof s === 'string')) {
            this.path = prev_file_contents.path
        }

        if (this.hasProp(prev_file_contents, 'data')) {
            this.data = prev_file_contents.data as JsonObj
        }
    }

    public OverwriteLastAccessed(prev_file_contents: any) {
        if (typeof prev_file_contents.tick_last_accessed === 'number') {
            this.tick_last_accessed = prev_file_contents.tick_last_accessed
        }
    }

    public UpdateSaveFunction(fn: (file: ScreepFile) => void) {
        this.SaveToMemory = fn
    }

    public ShouldDeleteFile() {
        return Game.time - this.tick_last_accessed >= 10
    }

    public UpdateLastAccessed() {
        this.tick_last_accessed = Game.time
    }

    public MarkForDeletion() {
        this.can_delete = true
    }

    public GetFileAge() {
        return Game.time - this.tick_last_accessed
    }

    public GetPath() {
        return this.path
    }

    public SetFileName(name: string) {
        this.file_name = name
    }

    public ToJson() {
        let json: any = {
            tick_last_accessed: this.tick_last_accessed,
            path: this.path,
            file_name: this.file_name,
            data: this.data
        }

        if (this.can_delete) { json.can_delete = this.can_delete }

        return json
    }

    public WriteToFile(key: BaseJsonValue, value: Json) {
        key = String(key)
        this.data[key] = value
        this.SaveToMemory(this)
    }

    public WriteAllToFile(data: {key: BaseJsonValue, value: Json}[]) {
        for (let entry of data) {
            this.data[String(entry.key)] = entry.value
        }

        this.SaveToMemory(this)
    }

    public ReadFromFile(key: BaseJsonValue) {
        key = String(key)
        if (this.data[key] === undefined) {
            throw new Error(`Accessing non-existent data ${key} in file ${this.file_name}`)
        }

        return this.data[key]
    }
}
