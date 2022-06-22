"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonTreeNode = exports.NodeTypes = void 0;
var NodeTypes;
(function (NodeTypes) {
    NodeTypes[NodeTypes["JSON_MAP"] = 0] = "JSON_MAP";
    NodeTypes[NodeTypes["JSON_ARRAY"] = 1] = "JSON_ARRAY";
    NodeTypes[NodeTypes["JSON_NUM"] = 2] = "JSON_NUM";
    NodeTypes[NodeTypes["JSON_STR"] = 3] = "JSON_STR";
    NodeTypes[NodeTypes["JSON_BOOL"] = 4] = "JSON_BOOL";
    NodeTypes[NodeTypes["JSON_NULL"] = 5] = "JSON_NULL";
    NodeTypes[NodeTypes["JSON_EMPTY"] = 6] = "JSON_EMPTY";
})(NodeTypes = exports.NodeTypes || (exports.NodeTypes = {}));
class JsonTreeNode {
    constructor(data = undefined) {
        this.m_time_since_last_access = Game.time;
        this.m_type = NodeTypes.JSON_EMPTY;
        this.m_data = data;
        if (data !== undefined) {
            this.m_type = this.GetTypeOfData(data);
        }
    }
    GetTypeOfData(data) {
        let type;
        if (typeof data === 'number') {
            type = NodeTypes.JSON_NUM;
        }
        else if (typeof data === 'string') {
            type = NodeTypes.JSON_STR;
        }
        else if (typeof data === 'boolean') {
            type = NodeTypes.JSON_BOOL;
        }
        else if (data === null) {
            type = NodeTypes.JSON_NULL;
        }
        else if (data instanceof Array) {
            type = NodeTypes.JSON_ARRAY;
        }
        else {
            type = NodeTypes.JSON_MAP;
        }
        return type;
    }
    WithinBoundsOfJsonArray(index) {
        return this.m_type === NodeTypes.JSON_ARRAY && index >= 0 && index < this.m_data.length;
    }
    UpdateLastAccessTime() {
        this.m_time_since_last_access = Game.time;
    }
    LastAccessedAt() {
        return this.m_time_since_last_access;
    }
    Type() {
        this.UpdateLastAccessTime();
        return this.m_type;
    }
    SetData(data) {
        this.UpdateLastAccessTime();
        const type = this.GetTypeOfData(data);
        if (this.m_type === type) {
            this.m_data = data;
        }
    }
    GetData() {
        this.UpdateLastAccessTime();
        return this.m_data;
    }
    GetFromArray(index) {
        this.UpdateLastAccessTime();
        if (this.WithinBoundsOfJsonArray(index)) {
            return this.m_data[index];
        }
        return new JsonTreeNode();
    }
    PutInArray(index, data) {
        this.UpdateLastAccessTime();
        if (this.WithinBoundsOfJsonArray(index)) {
            this.m_data[index] = new JsonTreeNode(data);
        }
    }
    PushBackData(data) {
        this.UpdateLastAccessTime();
        if (this.m_type === NodeTypes.JSON_ARRAY) {
            this.m_data.push(new JsonTreeNode(data));
        }
    }
    PushBackNode(data) {
        this.UpdateLastAccessTime();
        if (this.m_type === NodeTypes.JSON_ARRAY) {
            this.m_data.push(data);
        }
    }
    SizeOfArray() {
        this.UpdateLastAccessTime();
        return this.m_type === NodeTypes.JSON_ARRAY ? this.m_data.length : -1;
    }
    FilterArray(callback) {
        this.UpdateLastAccessTime();
        if (this.m_type === NodeTypes.JSON_ARRAY) {
            this.m_data = this.m_data.filter(callback);
        }
    }
    GetChild(name) {
        this.UpdateLastAccessTime();
        if (this.m_type === NodeTypes.JSON_MAP && this.m_data.has(name)) {
            return this.m_data.get(name);
        }
        return new JsonTreeNode();
    }
    CreateChild(name, data) {
        this.UpdateLastAccessTime();
        if (this.m_type === NodeTypes.JSON_MAP) {
            const new_child = new JsonTreeNode(data);
            this.m_data.set(name, new_child);
            return new_child;
        }
        return new JsonTreeNode();
    }
    AddChild(name, data) {
        this.UpdateLastAccessTime();
        if (this.m_type === NodeTypes.JSON_MAP) {
            this.m_data.set(name, data);
        }
    }
    RemoveChild(name) {
        this.UpdateLastAccessTime();
        if (this.m_type === NodeTypes.JSON_MAP) {
            this.m_data.delete(name);
        }
    }
    SizeOfMap() {
        this.UpdateLastAccessTime();
        return this.m_type === NodeTypes.JSON_MAP ? this.m_data.size : -1;
    }
    GetMapKeys() {
        this.UpdateLastAccessTime();
        const keys = [];
        if (this.m_type === NodeTypes.JSON_MAP) {
            this.m_data.forEach((val, map_key) => {
                keys.push(map_key);
            });
        }
        return keys;
    }
    GetMapVals() {
        this.UpdateLastAccessTime();
        const vals = [];
        if (this.m_type === NodeTypes.JSON_MAP) {
            this.m_data.forEach((map_val) => {
                vals.push(map_val);
            });
        }
        return vals;
    }
}
exports.JsonTreeNode = JsonTreeNode;
