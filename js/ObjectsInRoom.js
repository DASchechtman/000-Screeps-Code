"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectsInRoom = void 0;
var ObjectsInRoom = /** @class */ (function () {
    function ObjectsInRoom() {
        this.MAP_TYPE = -1;
        this.ARRAY_TYPE = -2;
        this.m_Objects = new Map();
    }
    ObjectsInRoom.prototype.AddKey = function (key, type) {
        if (!this.m_Objects.has(key)) {
            if (type === this.MAP_TYPE) {
                this.m_Objects.set(key, new Map());
            }
            else if (type == this.ARRAY_TYPE) {
                this.m_Objects.set(key, new Array());
            }
        }
    };
    ObjectsInRoom.prototype.AddMap = function (key1, key2, val) {
        var _a;
        this.AddKey(key1, this.MAP_TYPE);
        var map = this.m_Objects.get(key1);
        if (!map.has(key2)) {
            map.set(key2, new Array());
        }
        (_a = map.get(key2)) === null || _a === void 0 ? void 0 : _a.push(val);
    };
    ObjectsInRoom.prototype.AddArray = function (key, val) {
        this.AddKey(key, this.ARRAY_TYPE);
        var array = this.m_Objects.get(key);
        array.push(val);
    };
    ObjectsInRoom.prototype.GetMap = function (key) {
        var map = undefined;
        if (this.m_Objects.get(key) instanceof Map) {
            map = this.m_Objects.get(key);
        }
        return map;
    };
    ObjectsInRoom.prototype.GetArray = function (key) {
        var array = undefined;
        if (this.m_Objects.get(key) instanceof Array) {
            array = this.m_Objects.get(key);
        }
        return array;
    };
    ObjectsInRoom.prototype.Has = function (key) {
        return this.m_Objects.has(key);
    };
    ObjectsInRoom.prototype.Clear = function () {
        this.m_Objects.clear();
    };
    ObjectsInRoom.MY_CONSTRUCTION_SITES = 0;
    ObjectsInRoom.SOURCES = 1;
    ObjectsInRoom.MY_STRUCTS = 2;
    ObjectsInRoom.HOSTILE_STRUCTS = 3;
    ObjectsInRoom.UNOWNED_STRUCTS = 4;
    ObjectsInRoom.MY_CREEPS = 5;
    ObjectsInRoom.HOSTILE_CREEPS = 6;
    return ObjectsInRoom;
}());
exports.ObjectsInRoom = ObjectsInRoom;
