"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreepRoom = void 0;
var Consts_1 = require("../Consts");
var ScreepRoom = /** @class */ (function () {
    function ScreepRoom(room_name) {
        this.m_Owned_struct_ids = new Map();
        this.m_Hostile_struct_ids = new Map();
        this.m_Struct_ids = new Map();
        this.m_Name = room_name;
        var room = Game.rooms[this.m_Name];
        if (room) {
            var s = room.find(FIND_STRUCTURES);
            for (var _i = 0, s_1 = s; _i < s_1.length; _i++) {
                var struct = s_1[_i];
                var type = struct.structureType;
                if (this.IsOwned(struct)) {
                    this.AddStructToList(type, struct, this.m_Owned_struct_ids);
                }
                else if (this.IsHostile(struct)) {
                    this.AddStructToList(type, struct, this.m_Hostile_struct_ids);
                }
                else {
                    this.AddStructToList(type, struct, this.m_Struct_ids);
                }
            }
        }
    }
    ScreepRoom.prototype.IsOwned = function (struct) {
        var is_owned = false;
        if (struct instanceof OwnedStructure
            && Consts_1.Owner === struct.owner.username) {
            is_owned = true;
        }
        return is_owned;
    };
    ScreepRoom.prototype.IsHostile = function (struct) {
        var is_hostile = false;
        if (struct instanceof OwnedStructure
            && Consts_1.Owner !== struct.owner.username) {
        }
        return is_hostile;
    };
    ScreepRoom.prototype.CreateStructList = function (struct_type, map) {
        map.set(struct_type, new Array());
    };
    ScreepRoom.prototype.HasStructList = function (struct_type, map) {
        return map.has(struct_type);
    };
    ScreepRoom.prototype.AddStructToList = function (struct_type, struct, map) {
        var _a;
        if (!this.HasStructList(struct_type, map)) {
            this.CreateStructList(struct_type, map);
        }
        (_a = map.get(struct_type)) === null || _a === void 0 ? void 0 : _a.push(struct.id);
    };
    return ScreepRoom;
}());
exports.ScreepRoom = ScreepRoom;
