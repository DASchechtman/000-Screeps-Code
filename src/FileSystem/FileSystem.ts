import { FILE_ENDING, FOLDER_ENDING, ScreepFile } from "./File"
import { FileObjectManager } from "./FileObjManager"

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
                if (folder_obj[FOLDER_NAME] == null && creating_file) {
                    folder_obj[FOLDER_NAME] = {}
                }
                else if (folder_obj[FOLDER_NAME] == null && !creating_file) {
                    folder_obj = null
                    file = 'null'
                    break
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

    private SaveFilesToMemory() {
        this.file_obj_manager.Map((file) => {
            if (file.ShouldDeleteFile()) { return }
            const [FOLDER_OBJ, FILE_NAME] = this.GetFileDataFromMemory(file.GetPath())
            FOLDER_OBJ[FILE_NAME] = {
                ...FOLDER_OBJ[FILE_NAME],
                ...file.ToJson()
            }
        })
    }

    private CleanUpMemory() {
        const CheckAllFiles = (file: any) => {
            for (let key of Object.getOwnPropertyNames(file)) {
                if (file[key].can_delete) {
                    delete file[key]
                }
                else if (key.endsWith(FOLDER_ENDING)) {
                    const CONTAINS_FILES = Object.getOwnPropertyNames(file[key]).length > 0
                    if (CONTAINS_FILES) {
                        CheckAllFiles(file[key])
                    }
                    else {
                        delete file[key]
                    }
                }
                else if (key.endsWith(FILE_ENDING)) {
                    const FILE = this.file_obj_manager.GiveFile()
                    FILE.OverwriteFile(file[key])
                    if (FILE.ShouldDeleteFile()) {
                        delete file[key]
                    }
                    this.file_obj_manager.ReturnFile(FILE)
                }
                else {
                    delete file[key]
                }
            }
        }

        CheckAllFiles(Memory)
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

            FOLDER_OBJ[FILE_NAME] = FILE
        }
        else {
            FILE.OverwriteFile(FOLDER_OBJ[FILE_NAME])
        }

        FILE.UpdateLastAccessed()

        return FILE
    }

    public GetExistingFile(path: string[]) {
        const [FOLDER_OBJ, FILE_NAME] = this.GetFileDataFromMemory(path, false)
        if (FOLDER_OBJ != null && FOLDER_OBJ[FILE_NAME] != null) {
            const FILE = this.file_obj_manager.GiveFile()
            FILE.OverwriteFile(FOLDER_OBJ[FILE_NAME])
            FILE.UpdateLastAccessed()
            return FILE
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
        this.SaveFilesToMemory()
        this.CleanUpMemory()
    }
}
