import { JsonObj } from "../../types/Interfaces"
import { JsonList, JsonType } from "../../types/Types"

interface DiskInfo {
    disk: JsonObj
    data_id: string
}

export class HardDrive {
    private static disk_data: JsonObj | null = null
    private static readonly sep: string = '/'
    private static readonly folder_attr: string = "folder"

    private static LoadData(): JsonObj {
        if (!HardDrive.disk_data) {
            try {
                HardDrive.disk_data = JSON.parse(RawMemory.get())
            }
            catch {
                HardDrive.disk_data = {}
            }
        }
        return HardDrive.disk_data!!
    }

    private static GetInfoAt(path_name: string): DiskInfo {
        const path = path_name.split(this.sep)
        const data: DiskInfo = {
            disk: this.LoadData(),
            data_id: ""
        }

        for (let i = 0; i < path.length - 1; i++) {

            let path_part = data.disk[path[i]]
            const make_folder = !Boolean(path_part)
            if (make_folder) {
                data.disk[path[i]] = {}
                path_part = data.disk[path[i]];
                (path_part as JsonObj)[this.folder_attr] = true
            }
            data.disk = path_part as JsonObj

        }

        data.data_id = path[path.length - 1]
        return data
    }

    static Join(...args: string[]) {
        let path = ""

        for (let path_part of args) {
            if (path_part.length > 0) {
                if (path.length === 0) {
                    path = path_part
                }
                else {
                    path += this.sep + path_part
                }
            }
        }

        return path
    }

    private static IsJsonType(data: JsonObj | JsonType): boolean {
        let is_json_type = false
        const type = typeof data

        if (type === 'object' && (data === null || data instanceof Array)) {
            is_json_type = true
        }
        else if (type !== 'object') {
            is_json_type = true
        }

        return is_json_type
    }

    private static DeleteData(data: JsonObj, id: string, is_wrong_data: boolean, msg: string): void {
        try {
            if (data[id] !== undefined) {
                if (is_wrong_data) {
                    throw new Error(msg)
                }

                delete data[id]
            }
        }
        catch(e) {
            const error = e as Error
            console.log(error.stack)
        }
    }

    private static ReadData(
        disk: JsonObj, 
        part: string, 
        filler_data: null | JsonObj, 
        is_wrong_type: boolean, 
        msg: string
    ): JsonType | JsonObj {
        let data_obj = disk[part]

        try {
            if (data_obj === undefined) {
                data_obj = filler_data
            }
            else if (is_wrong_type) {
                throw new Error(msg)
            }
        }
        catch (e) {
            const error = e as Error
            data_obj = filler_data
            console.log(error.stack)
        }

        return data_obj
    }

    static WriteFile(file_path: string, data: JsonType): void {
        const save_data = this.GetInfoAt(file_path)
        const disk = save_data.disk
        const file = save_data.data_id
        disk[file] = data
    }

    static ReadFile(file_path: string): JsonType {
        const save_data = this.GetInfoAt(file_path)
        const disk = save_data.disk
        const file = save_data.data_id
        const is_wrong_data = !this.IsJsonType(disk[file])

        return this.ReadData(disk, file, null, is_wrong_data, "Error: Trying to read a folder") as JsonType
    }

    static WriteFiles(path_base: string, files: JsonObj): void {
        const keys_to_files = (val: string): [string, JsonType] => {return [val, files[val] as JsonType]}
        const json_to_tuples = Object.getOwnPropertyNames(files).map(keys_to_files)

        for(let file of json_to_tuples) {
            const path = this.Join(path_base, file[0])
            this.WriteFile(path, file[1])
        }
    }

    static ReadFolder(file_path: string): JsonObj  {
        const disk_data = this.GetInfoAt(file_path)
        const folder = disk_data.disk
        const name = disk_data.data_id
        const is_wrong_data = this.IsJsonType(folder[name])

        return this.ReadData(folder, name, {}, is_wrong_data, "Error: Trying to read a file") as JsonObj
    }

    static DeleteFolder(folder_path: string): void {
        let disk = this.GetInfoAt(folder_path)
        let data = disk.disk
        let part = disk.data_id

        this.DeleteData(data, part, this.IsJsonType(data[part]), "Error: Trying to delete file")
    }

    static DeleteFile(file_path: string): void {
        let disk = this.GetInfoAt(file_path)
        let data = disk.disk
        let part = disk.data_id
        this.DeleteData(data, part, !this.IsJsonType(data[part]), "Error: Trying to delete a folder")
    }

    static CommitChanges(): void {
        if (HardDrive.disk_data) {
            RawMemory.set(JSON.stringify(HardDrive.disk_data))
            HardDrive.disk_data = null
        }
    }
}