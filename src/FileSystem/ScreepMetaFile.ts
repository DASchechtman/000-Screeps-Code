import { ScreepFile } from "./File"

export class ScreepMetaFile {
    private tick_last_accessed: number = -1
    private file_name: string = ""
    private path: string[] = []
    private can_delete: boolean = false
    private file: ScreepFile
    private file_in_mem: any

    private hasProp(obj: unknown, key: string): obj is Record<string, unknown> {
        return typeof obj === 'object' && obj !== null && key in obj
    }

    constructor(read: (key: string) => any | undefined, write: (key: string, value: any) => void) {
        this.file = new ScreepFile(write, read, () => this.file_name, () => this.can_delete = true)
    }

    public GetFile() {
        return this.file
    }

    public OverwriteFile(prev_file_contents: ScreepMetaFile | unknown) {
        if (prev_file_contents instanceof ScreepMetaFile) {
            this.tick_last_accessed = prev_file_contents.tick_last_accessed
            this.file_name = prev_file_contents.file_name
            this.path = prev_file_contents.path
            this.file_in_mem = prev_file_contents.file_in_mem
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

        if (this.hasProp(prev_file_contents, 'mem')) {
            this.file_in_mem = prev_file_contents.mem
        }
    }

    public ShouldDeleteFile() {
        return Game.time - this.tick_last_accessed >= 10
    }

    public UpdateLastAccessed() {
        this.tick_last_accessed = Game.time
    }

    public GetPath() {
        return this.path
    }


    public AppendMetaDataToObject(obj: any) {
        obj.tick_last_accessed = this.tick_last_accessed
        obj.path = this.path
        obj.file_name = this.file_name
        obj.can_delete = this.can_delete ? true : undefined
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
}
