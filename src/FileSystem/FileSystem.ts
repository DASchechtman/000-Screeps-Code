import { BaseJsonValue, Json } from "Consts"
import { ScreepFile, FILE_ENDING, FOLDER_ENDING, ScreepMetaFile } from "./File"
import { FileObjectManager } from "./FileObjManager"

function DefaultFileSave(obj: any, key: string) {
    return (data_key: string, val: any) => {
        if (obj[key]['data'] === undefined) { obj[key]['data'] = {} }
        obj[key]['data'][data_key] = val
    }
}

function DefaultFileRead(obj: any, key: string) {
    return (data_key: string) => {
        if (obj[key]['data'] === undefined) { return undefined }
        return obj[key]['data'][data_key]
    }
}

export class FileSystem {
    private static file_system: FileSystem | null = null

    public static GetFileSystem() {
        if (this.file_system === null) { this.file_system = new FileSystem() }
        return this.file_system
    }

    private file_obj_manager: FileObjectManager

    private constructor() {
        this.file_obj_manager = FileObjectManager.GetManager()
    }

    private GetFileDataFromMemory(path: string[], creating_file: boolean = true): [any, string] {
        let folder_obj: any = Memory
        let file = ""

        if (path.length === 0) {
            folder_obj = null
            file = 'null'
        }

        for (let i = 0; i < path.length; i++) {
            const NAME = path[i]
            const FOLDER_NAME = `${NAME}${FOLDER_ENDING}`
            const FILE_NAME = `${NAME}${FILE_ENDING}`

            if (i < path.length - 1) {
                if (folder_obj[FOLDER_NAME] == null) {
                    if (creating_file) {
                        folder_obj[FOLDER_NAME] = {}
                    }
                    else {
                        folder_obj = null
                        file = 'null'
                        break
                    }
                }

                folder_obj = folder_obj[FOLDER_NAME]
            }
            else {
                file = FILE_NAME
                break
            }
        }

        return [folder_obj, file]
    }

    private CleanUpMemory() {
        const Delete = (o: any, key: string) => {
            o[key] = undefined
        }

        const CheckAllFiles = (file: any) => {
            for (let key of Object.getOwnPropertyNames(file)) {

                if (file[key].can_delete) {
                    Delete(file, key)
                }
                else if (key.endsWith(FOLDER_ENDING)) {
                    const CONTAINS_FILES = Object.getOwnPropertyNames(file[key]).length > 0
                    if (CONTAINS_FILES) {
                        CheckAllFiles(file[key])
                    }
                    else {
                        Delete(file, key)
                    }
                }
                else if (key.endsWith(FILE_ENDING)) {
                    const READ = DefaultFileRead(file, key)
                    const WRITE = DefaultFileSave(file, key)
                    const FILE = this.file_obj_manager.GiveFile()
                    FILE.OverwriteFile(file[key])
                    if (FILE.ShouldDeleteFile()) {
                        Delete(file, key)
                    }
                    this.file_obj_manager.ReturnFile(FILE)
                }
                else {
                    Delete(file, key)
                }
            }
        }

        CheckAllFiles(Memory)
    }

    private ConvertScreepFileToFile(sfile: ScreepMetaFile): ScreepFile {
        return {
            WriteToFile: function (key: BaseJsonValue, value: Json) {
                sfile.WriteToFile(key, value)
            },
            WriteAllToFile: function (data: { key: BaseJsonValue, value: Json }[]) {
                sfile.WriteAllToFile(data)
            },
            ReadFromFile: function (key: BaseJsonValue) {
                return sfile.ReadFromFile(key)
            },
            MarkForDeletion: function () {
                sfile.MarkForDeletion()
            }
        }
    }

    public GetFile(path: string[]): ScreepFile {
        if (path.length === 0) { throw new Error('Cannot use an empty path') }
        const [FOLDER_OBJ, FILE_NAME] = this.GetFileDataFromMemory(path)
        const FILE = this.file_obj_manager.GiveFile()

        if (FOLDER_OBJ[FILE_NAME] == null) {
            FILE.OverwriteFile({
                tick_last_accessed: Game.time,
                file_name: path.join('/'),
                path: path,
                data: {},
                can_delete: false
            })
            FOLDER_OBJ[FILE_NAME] = {}
        }
        else {
            FILE.OverwriteFile({
                ...FOLDER_OBJ[FILE_NAME],
                file_name: path.join('/'),
                path: path
            })
        }

        FILE.UpdateLastAccessed()

        return this.ConvertScreepFileToFile(FILE)
    }

    public GetExistingFile(path: string[]): ScreepFile | null {
        const [FOLDER_OBJ, FILE_NAME] = this.GetFileDataFromMemory(path, false)
        if (FOLDER_OBJ != null && FOLDER_OBJ[FILE_NAME] != null) {
            const READ = DefaultFileRead(FOLDER_OBJ, FILE_NAME)
            const WRITE = DefaultFileSave(FOLDER_OBJ, FILE_NAME)
            const FILE = this.file_obj_manager.GiveFile()
            FILE.OverwriteFile(FOLDER_OBJ[FILE_NAME])
            FILE.UpdateLastAccessed()
            FILE.UpdateAccessFunctions(WRITE, READ)
            return this.ConvertScreepFileToFile(FILE)
        }
        return null
    }

    public DoesFileExist(path: string[]) {
        const [FOLDER_OBJ, FILE_NAME] = this.GetFileDataFromMemory(path, false)
        return FOLDER_OBJ != null && FOLDER_OBJ[FILE_NAME] != null
    }

    public DeleteFile(path: string[]) {
        const [FOLDER_OBJ, FILE_NAME] = this.GetFileDataFromMemory(path, false)
        if (FOLDER_OBJ != null) {
            try {
                FOLDER_OBJ[FILE_NAME].MarkForDeletion()
            }
            catch {
                FOLDER_OBJ[FILE_NAME].can_delete = true
            }
        }
    }

    public Cleanup() {
        this.file_obj_manager.ReturnAllFiles()
        this.CleanUpMemory()
    }

    public ClearFileSystem() {
        for (let key of Object.keys(Memory)) {
            Memory[key] = undefined
        }
    }

    public PrintFileSystem() {
        console.log(JSON.stringify(Memory, null, 2))
    }
}
