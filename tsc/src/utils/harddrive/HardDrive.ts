import { JsonObj } from "../../types/Interfaces"
import { JsonArray, JsonMap, JsonTreeNode, JsonType, NodeTypes } from "./JsonTreeNode"


export class HardDrive {
    private static m_json_root: JsonTreeNode = new JsonTreeNode(new Map())
    private static readonly sep: string = '/'

    private static CreateJsonArray(arr: Array<any>): JsonTreeNode {
        let ret = new JsonTreeNode(new Array())

        for (let i of arr) {
            if (i instanceof Array) {
                ret.PushBackNode(this.CreateJsonArray(i))
            }
            else if (typeof i === 'object') {
                let root = new JsonTreeNode(new Map())
                this.CreateJsonTree(root, i)
                ret.PushBackNode(root)
            }
            else {
                ret.PushBackData(i as JsonType)
            }
        }

        return ret
    }

    private static CreateJsonTree(json_root: JsonTreeNode, tree: any = undefined): void {

        if (tree === undefined) {
            let data = RawMemory.get();
            if (data.length === 0) { data = "{}"}
            tree = JSON.parse(data)
        }

        for(let entry of Object.entries(tree)) {
            if (entry[1] instanceof Array) {
                json_root.AddChild(entry[0], this.CreateJsonArray(entry[1]))
            }
            else if (typeof entry[1] === 'object') {
               const child = new JsonTreeNode(new Map())
               this.CreateJsonTree(child, entry[1])
               json_root.AddChild(entry[0], child)
            }
            else {
                json_root.CreateChild(entry[0], entry[1] as JsonType)
            }
        }

    }

    private static GetNode(path: Array<string>, exclude_from_end: number = 1) {
        let node = this.m_json_root

        for(let i = 0; i < path.length-exclude_from_end; i++) {
            if (node.GetChild(path[i]).Type() === NodeTypes.JSON_EMPTY) {
                node.CreateChild(path[i], new Map())
            }
            node = node.GetChild(path[i])
        }

        return node
    }

    private static StringifyNode(node: JsonTreeNode) {
        let str_rep = ""
        const last_access_time = node.LastAccessedAt()

        switch(node.Type()) {
            case NodeTypes.JSON_MAP: {
                if (Game.time - last_access_time >= 50) { break }
                str_rep = '{'
                let index = 0
                let map = (node.GetData() as JsonMap)
                map.forEach((node, key, map) => {
                    str_rep += `"${key}":${this.StringifyNode(node)}`
                    if (index !== map.size - 1) {
                        str_rep += ','
                    }
                    index++
                })
                str_rep += '}'
                break
            }
            case NodeTypes.JSON_ARRAY: {
                str_rep = '['
                let arr = (node.GetData() as JsonArray)
                arr.forEach((node, index, array) => {
                    str_rep += this.StringifyNode(node)
                    if (index !== array.length - 1) {
                        str_rep += ','
                    }
                })
                str_rep += ']'
                break
            }
            case NodeTypes.JSON_NULL: {
                str_rep = "null"
                break
            }
            case NodeTypes.JSON_STR: {
                str_rep = `"${node.GetData()}"`
                break
            }
            default: {
                str_rep = `${node.GetData()}`
            }
        }

        return str_rep
    }

    static LoadData(): void {
        if(this.m_json_root.SizeOfMap() > 0) { return }
        this.CreateJsonTree(this.m_json_root)
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

    static WriteFile(file_path: string, data: JsonType): void {
        let arr = file_path.split(this.sep)
        this.GetNode(arr).CreateChild(arr[arr.length-1], data)
    }

    static ReadFile(file_path: string): JsonType {
        let arr = file_path.split(this.sep)
        let data = this.GetNode(arr).GetChild(arr[arr.length-1]).GetData()
        if (data === undefined) {
            data = null
        }
        return data
    }

    static WriteFiles(path_base: string, files: JsonObj): void {
        let arr = path_base.split(this.sep)
        let node = this.GetNode(arr, 0)
        this.CreateJsonTree(node, files)
    }

    static ReadFolder(file_path: string): JsonObj  {
        let node = this.GetNode(file_path.split(this.sep), 0)
        let obj: JsonObj = {}
        for(let key of node.GetMapKeys()) {
            obj[key] = node.GetChild(key).GetData()!
        }
        return obj
    }

    static DeleteFolder(folder_path: string): void {
        let arr = folder_path.split(this.sep)
        let node = this.GetNode(arr, 0)
        let keys = node.GetMapKeys()

        for(let key of keys) {
            node.RemoveChild(key)
        }
    }

    static HasFile(file_path: string): boolean {
        let has = true

        let path_parts = file_path.split(this.sep)
        let node = this.m_json_root

        for(const part of path_parts) {
            if (node.GetChild(part).Type() === NodeTypes.JSON_EMPTY) {
                has = false
                break
            }
        }

        return has
    }

    static DeleteFile(file_path: string): void {
        let arr = file_path.split(this.sep)
        this.GetNode(arr).RemoveChild(arr[arr.length-1])
    }

    static CommitChanges(): void {
        const data = this.StringifyNode(this.m_json_root)
        RawMemory.set(data)
    }
}