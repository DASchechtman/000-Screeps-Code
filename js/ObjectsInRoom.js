"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectsInRoom = void 0;
class ObjectsInRoom {
    constructor() {
        this.MAP_TYPE = -1;
        this.ARRAY_TYPE = -2;
        this.m_Objects = new Map();
    }
    AddKey(key, type) {
        if (!this.m_Objects.has(key)) {
            if (type === this.MAP_TYPE) {
                this.m_Objects.set(key, new Map());
            }
            else if (type == this.ARRAY_TYPE) {
                this.m_Objects.set(key, new Array());
            }
        }
    }
    AddMap(key1, key2, val) {
        var _a;
        this.AddKey(key1, this.MAP_TYPE);
        const map = this.m_Objects.get(key1);
        if (!map.has(key2)) {
            map.set(key2, new Array());
        }
        (_a = map.get(key2)) === null || _a === void 0 ? void 0 : _a.push(val);
    }
    AddArray(key, val) {
        this.AddKey(key, this.ARRAY_TYPE);
        const array = this.m_Objects.get(key);
        array.push(val);
    }
    GetMap(key) {
        let map = undefined;
        if (this.m_Objects.get(key) instanceof Map) {
            map = this.m_Objects.get(key);
        }
        return map;
    }
    GetArray(key) {
        let array = undefined;
        if (this.m_Objects.get(key) instanceof Array) {
            array = this.m_Objects.get(key);
        }
        return array;
    }
    Has(key) {
        return this.m_Objects.has(key);
    }
    Clear() {
        this.m_Objects.clear();
    }
}
exports.ObjectsInRoom = ObjectsInRoom;
ObjectsInRoom.MY_CONSTRUCTION_SITES = 0;
ObjectsInRoom.SOURCES = 1;
ObjectsInRoom.MY_STRUCTS = 2;
ObjectsInRoom.HOSTILE_STRUCTS = 3;
ObjectsInRoom.UNOWNED_STRUCTS = 4;
ObjectsInRoom.MY_CREEPS = 5;
ObjectsInRoom.HOSTILE_CREEPS = 6;
