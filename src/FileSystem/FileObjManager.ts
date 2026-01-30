import { ScreepMetaFile } from "./File"

export class FileObjectManager {
    private static manager: FileObjectManager | null = null

    public static GetManager() {
        if (this.manager === null) { this.manager = new FileObjectManager() }
        return this.manager
    }

    private file_pool: Array<ScreepMetaFile>
    private available_files: Map<ScreepMetaFile, number>
    private reserved_files: Map<ScreepMetaFile, number>

    private constructor() {
        this.file_pool = []
        this.available_files = new Map()
        this.reserved_files = new Map()
    }

    public GiveFile() {
        const ITERATOR = this.available_files.keys()
        const FILE = ITERATOR.next().value

        if (FILE === undefined) {
            const NEW_FILE = new ScreepMetaFile()
            this.file_pool.push(NEW_FILE)
            this.reserved_files.set(NEW_FILE, this.file_pool.length - 1)
            return NEW_FILE
        }


        const FILE_INDEX = this.available_files.get(FILE)!
        this.available_files.delete(FILE)
        this.reserved_files.set(FILE, FILE_INDEX)

        return FILE
    }

    public ReturnFile(file: ScreepMetaFile) {
        if (this.reserved_files.has(file)) {
            const INDEX = this.reserved_files.get(file)!
            this.reserved_files.delete(file)
            this.available_files.set(file, INDEX)
        }
    }

    public ReturnAllFiles() {
        for(let [file, _] of this.reserved_files) {
            this.ReturnFile(file)
        }
    }

    public Map(fn: (s: ScreepMetaFile) => void) {
        for (let file of this.file_pool) {
            fn(file)
        }
    }

}
