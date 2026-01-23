type BaseJsonValue = string | number | boolean | null
type JsonArray = Array<BaseJsonValue | JsonObj | JsonArray>
interface JsonObj { [key: string]: BaseJsonValue | JsonObj | JsonArray }
type Json = BaseJsonValue | JsonObj | JsonArray

export const FILE_ENDING = ':file'
export const FOLDER_ENDING = ':folder'

export class ScreepFile {
    private tick_last_accessed: number = -1
    private file_name: string = ""
    private path: string[] = []
    private data: JsonObj = {}

    public OverwriteFile(prev_file_contents: any) {
        this.OverwriteLastAccessed(prev_file_contents)

        if (typeof prev_file_contents.file_name === 'string') {
            this.file_name = prev_file_contents.file_name
        }

        if (Array.isArray(prev_file_contents.path) && prev_file_contents.path.every((x: any) => typeof x === 'string')) {
            this.path = prev_file_contents.path
        }

        try {
            this.data = JSON.parse(prev_file_contents.data)
        } catch {
            this.data = {}
        }
    }

    public OverwriteLastAccessed(prev_file_contents: any) {
        if (typeof prev_file_contents.tick_last_accessed === 'number') {
            this.tick_last_accessed = prev_file_contents.tick_last_accessed
        }
    }

    public ShouldDeleteFile() {
        return Game.time - this.tick_last_accessed >= 10
    }

    public UpdateLastAccessed() {
        this.tick_last_accessed = Game.time
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

    public WriteToFile(key: string, value: Json) {
        this.data[key] = value
    }

    public ReadFromFile(key: string) {
        if (this.data[key] === undefined) {
            throw new Error(`Accessing non-existent data ${key} in file ${this.file_name}`)
        }

        return this.data[key]
    }

    public ToJson() {
        return {
            tick_last_accessed: this.tick_last_accessed,
            path: this.path,
            file_name: this.file_name,
            data: this.data
        }
    }

    public toString() {
        return `{
        tick_last_accessed: ${this.tick_last_accessed},
        path: ${this.path},
        file_name: ${this.file_name},
        data: ${JSON.stringify(this.data)}
        }`
    }
}
