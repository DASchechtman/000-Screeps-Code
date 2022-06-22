"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardDrive = void 0;
const CreepBehaviorConsts_1 = require("../../consts/CreepBehaviorConsts");
const JsonTreeNode_1 = require("./JsonTreeNode");
class HardDrive {
    static CreateJsonArray(arr) {
        let ret = new JsonTreeNode_1.JsonTreeNode(new Array());
        for (let i of arr) {
            if (i instanceof Array) {
                ret.PushBackNode(this.CreateJsonArray(i));
            }
            else if (typeof i === 'object') {
                let root = new JsonTreeNode_1.JsonTreeNode(new Map());
                this.CreateJsonTree(root, i);
                ret.PushBackNode(root);
            }
            else {
                ret.PushBackData(i);
            }
        }
        return ret;
    }
    static CreateJsonTree(json_root, tree = undefined) {
        if (tree === undefined) {
            tree = JSON.parse(RawMemory.get());
        }
        for (let entry of Object.entries(tree)) {
            if (entry[1] instanceof Array) {
                json_root.AddChild(entry[0], this.CreateJsonArray(entry[1]));
            }
            else if (typeof entry[1] === 'object') {
                const child = new JsonTreeNode_1.JsonTreeNode(new Map());
                this.CreateJsonTree(child, entry[1]);
                json_root.AddChild(entry[0], child);
            }
            else {
                json_root.CreateChild(entry[0], entry[1]);
            }
        }
    }
    static GetNode(path, exclude_from_end = 1) {
        let node = this.m_json_root;
        for (let i = 0; i < path.length - exclude_from_end; i++) {
            if (node.GetChild(path[i]).Type() === JsonTreeNode_1.NodeTypes.JSON_EMPTY) {
                node.CreateChild(path[i], new Map());
            }
            node = node.GetChild(path[i]);
        }
        return node;
    }
    static StringifyNode(node) {
        let str_rep = "";
        const last_access_time = node.LastAccessedAt();
        switch (node.Type()) {
            case JsonTreeNode_1.NodeTypes.JSON_MAP: {
                if (Game.time - last_access_time >= 50) {
                    break;
                }
                str_rep = '{';
                let index = 0;
                let map = node.GetData();
                map.forEach((node, key, map) => {
                    str_rep += `"${key}":${this.StringifyNode(node)}`;
                    if (index !== map.size - 1) {
                        str_rep += ',';
                    }
                    index++;
                });
                str_rep += '}';
                break;
            }
            case JsonTreeNode_1.NodeTypes.JSON_ARRAY: {
                str_rep = '[';
                let arr = node.GetData();
                arr.forEach((node, index, array) => {
                    str_rep += this.StringifyNode(node);
                    if (index !== array.length - 1) {
                        str_rep += ',';
                    }
                });
                str_rep += ']';
                break;
            }
            case JsonTreeNode_1.NodeTypes.JSON_NULL: {
                str_rep = "null";
                break;
            }
            case JsonTreeNode_1.NodeTypes.JSON_STR: {
                str_rep = `"${node.GetData()}"`;
                break;
            }
            default: {
                str_rep = `${node.GetData()}`;
            }
        }
        return str_rep;
    }
    static LoadData() {
        if (this.m_json_root.SizeOfMap() > 0) {
            return;
        }
        this.CreateJsonTree(this.m_json_root);
    }
    static Join(...args) {
        let path = "";
        for (let path_part of args) {
            if (path_part.length > 0) {
                if (path.length === 0) {
                    path = path_part;
                }
                else {
                    path += this.sep + path_part;
                }
            }
        }
        return path;
    }
    static WriteFile(file_path, data) {
        let arr = file_path.split(this.sep);
        if (data === CreepBehaviorConsts_1.Behavior.HARVEST) {
            console.log("writing", arr);
        }
        this.GetNode(arr).CreateChild(arr[arr.length - 1], data);
    }
    static ReadFile(file_path) {
        let arr = file_path.split(this.sep);
        let data = this.GetNode(arr).GetChild(arr[arr.length - 1]).GetData();
        if (data === undefined) {
            data = null;
        }
        return data;
    }
    static WriteFiles(path_base, files) {
        let arr = path_base.split(this.sep);
        let node = this.GetNode(arr, 0);
        this.CreateJsonTree(node, files);
    }
    static ReadFolder(file_path) {
        let node = this.GetNode(file_path.split(this.sep), 0);
        let obj = {};
        for (let key of node.GetMapKeys()) {
            obj[key] = node.GetChild(key).GetData();
        }
        return obj;
    }
    static DeleteFolder(folder_path) {
        let arr = folder_path.split(this.sep);
        let node = this.GetNode(arr, 0);
        let keys = node.GetMapKeys();
        for (let key of keys) {
            node.RemoveChild(key);
        }
    }
    static DeleteFile(file_path) {
        let arr = file_path.split(this.sep);
        this.GetNode(arr).RemoveChild(arr[arr.length - 1]);
    }
    static CommitChanges() {
        RawMemory.set(this.StringifyNode(this.m_json_root));
    }
}
exports.HardDrive = HardDrive;
HardDrive.disk_data = null;
HardDrive.m_json_root = new JsonTreeNode_1.JsonTreeNode(new Map());
HardDrive.sep = '/';
