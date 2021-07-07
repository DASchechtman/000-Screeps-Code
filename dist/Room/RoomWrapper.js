"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomWrapper = void 0;
var GameObjectConsts_1 = require("../Constants/GameObjectConsts");
var ObjectsInRoom_1 = require("./ObjectsInRoom");
var RoomWrapper = /** @class */ (function () {
    function RoomWrapper(room_name) {
        this.m_Name = room_name;
        this.m_Room_objects = new ObjectsInRoom_1.ObjectsInRoom();
        this.LoadRoomResources();
    }
    RoomWrapper.prototype.LoadRoomResources = function () {
        var room = Game.rooms[this.m_Name];
        if (room) {
            var found_structs = room.find(FIND_STRUCTURES);
            var sources = room.find(FIND_SOURCES);
            var construction_sites = room.find(FIND_MY_CONSTRUCTION_SITES);
            var my_creeps = room.find(FIND_MY_CREEPS);
            var hostile_creeps = room.find(FIND_HOSTILE_CREEPS);
            for (var _i = 0, found_structs_1 = found_structs; _i < found_structs_1.length; _i++) {
                var struct = found_structs_1[_i];
                struct.id;
                var type = struct.structureType;
                if (this.IsOwned(struct)) {
                    var key = ObjectsInRoom_1.ObjectsInRoom.MY_STRUCTS;
                    this.m_Room_objects.AddMap(key, type, struct.id);
                }
                else if (this.IsHostile(struct)) {
                    var key = ObjectsInRoom_1.ObjectsInRoom.HOSTILE_STRUCTS;
                    this.m_Room_objects.AddMap(key, type, struct.id);
                }
                else {
                    var key = ObjectsInRoom_1.ObjectsInRoom.UNOWNED_STRUCTS;
                    this.m_Room_objects.AddMap(key, type, struct.id);
                }
            }
            for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
                var energy = sources_1[_a];
                var key = ObjectsInRoom_1.ObjectsInRoom.SOURCES;
                this.m_Room_objects.AddArray(key, energy.id);
            }
            for (var _b = 0, construction_sites_1 = construction_sites; _b < construction_sites_1.length; _b++) {
                var site = construction_sites_1[_b];
                var key = ObjectsInRoom_1.ObjectsInRoom.MY_CONSTRUCTION_SITES;
                this.m_Room_objects.AddArray(key, site.id);
            }
            for (var _c = 0, my_creeps_1 = my_creeps; _c < my_creeps_1.length; _c++) {
                var creep = my_creeps_1[_c];
                var key = ObjectsInRoom_1.ObjectsInRoom.MY_CREEPS;
                this.m_Room_objects.AddArray(key, creep.id);
            }
            for (var _d = 0, hostile_creeps_1 = hostile_creeps; _d < hostile_creeps_1.length; _d++) {
                var hostile_creep = hostile_creeps_1[_d];
                var key = ObjectsInRoom_1.ObjectsInRoom.HOSTILE_CREEPS;
                this.m_Room_objects.AddArray(key, hostile_creep.id);
            }
        }
    };
    RoomWrapper.prototype.IsOwned = function (struct) {
        var is_owned = false;
        if (struct instanceof OwnedStructure
            && GameObjectConsts_1.Owner === struct.owner.username) {
            is_owned = true;
        }
        return is_owned;
    };
    RoomWrapper.prototype.IsHostile = function (struct) {
        var is_hostile = false;
        if (struct instanceof OwnedStructure
            && GameObjectConsts_1.Owner !== struct.owner.username) {
        }
        return is_hostile;
    };
    RoomWrapper.prototype.GetStructures = function (struct_type, map) {
        var found_structs = new Array();
        if (map) {
            var list = map.get(struct_type);
            if (list) {
                for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                    var id = list_1[_i];
                    var struct_id = id;
                    var struct = Game.getObjectById(struct_id);
                    if (struct) {
                        found_structs.push(struct);
                    }
                }
            }
        }
        return found_structs;
    };
    RoomWrapper.prototype.GetResource = function (key) {
        var resource_objects = new Array();
        var resource_array = this.m_Room_objects.GetArray(key);
        if (resource_array) {
            for (var _i = 0, resource_array_1 = resource_array; _i < resource_array_1.length; _i++) {
                var id = resource_array_1[_i];
                var resource_id = id;
                var resource = Game.getObjectById(resource_id);
                if (resource) {
                    resource_objects.push(resource);
                }
            }
        }
        return resource_objects;
    };
    RoomWrapper.prototype.GetOwnedStructures = function (struct_type) {
        var key = ObjectsInRoom_1.ObjectsInRoom.MY_STRUCTS;
        var map = this.m_Room_objects.GetMap(key);
        return this.GetStructures(struct_type, map);
    };
    RoomWrapper.prototype.GetHostileStructures = function (struct_type) {
        var key = ObjectsInRoom_1.ObjectsInRoom.HOSTILE_STRUCTS;
        var map = this.m_Room_objects.GetMap(key);
        return this.GetStructures(struct_type, map);
    };
    RoomWrapper.prototype.GetUnownedStructures = function (struct_type) {
        var key = ObjectsInRoom_1.ObjectsInRoom.UNOWNED_STRUCTS;
        var map = this.m_Room_objects.GetMap(key);
        return this.GetStructures(struct_type, map);
    };
    RoomWrapper.prototype.GetAllNonHostileStructs = function (filter) {
        var _a;
        var struct_type_keys = [
            ObjectsInRoom_1.ObjectsInRoom.MY_STRUCTS,
            ObjectsInRoom_1.ObjectsInRoom.UNOWNED_STRUCTS
        ];
        var structs = new Array();
        for (var _i = 0, struct_type_keys_1 = struct_type_keys; _i < struct_type_keys_1.length; _i++) {
            var key = struct_type_keys_1[_i];
            (_a = this.m_Room_objects.GetMap(key)) === null || _a === void 0 ? void 0 : _a.forEach(function (value, key) {
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var id = value_1[_i];
                    var struct_id = id;
                    var room_struct = Game.getObjectById(struct_id);
                    var is_filter = room_struct && filter && filter(room_struct);
                    var isnt_filter = room_struct && filter === undefined;
                    if (is_filter || isnt_filter) {
                        structs.push(room_struct);
                    }
                }
            });
        }
        return structs;
    };
    RoomWrapper.prototype.GetConstructionSites = function () {
        return this.GetResource(ObjectsInRoom_1.ObjectsInRoom.MY_CONSTRUCTION_SITES);
    };
    RoomWrapper.prototype.GetSources = function () {
        return this.GetResource(ObjectsInRoom_1.ObjectsInRoom.SOURCES);
    };
    RoomWrapper.prototype.GetMyCreeps = function () {
        return this.GetResource(ObjectsInRoom_1.ObjectsInRoom.MY_CREEPS);
    };
    RoomWrapper.prototype.GetHostileCreeps = function () {
        return this.GetResource(ObjectsInRoom_1.ObjectsInRoom.HOSTILE_CREEPS);
    };
    RoomWrapper.prototype.GetEnergyCapacity = function () {
        var room = Game.rooms[this.m_Name];
        var total_energy = -1;
        if (room) {
            total_energy = room.energyCapacityAvailable;
        }
        return total_energy;
    };
    RoomWrapper.prototype.GetEnergyStored = function () {
        var room = Game.rooms[this.m_Name];
        var stored_energy = -1;
        if (room) {
            stored_energy = room.energyAvailable;
        }
        return stored_energy;
    };
    RoomWrapper.prototype.GetName = function () {
        return this.m_Name;
    };
    return RoomWrapper;
}());
exports.RoomWrapper = RoomWrapper;
