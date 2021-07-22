"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomWrapper = void 0;
const GameObjectConsts_1 = require("./GameObjectConsts");
const ObjectsInRoom_1 = require("./ObjectsInRoom");
class RoomWrapper {
    constructor(room_name) {
        this.m_Name = room_name;
        this.m_Room = Game.rooms[room_name];
        this.m_Room_objects = new ObjectsInRoom_1.ObjectsInRoom();
    }
    LoadStructs(key, type, id) {
        this.m_Room_objects.AddMap(key, type, id);
    }
    LoadResources(key, id) {
        this.m_Room_objects.AddArray(key, id);
    }
    LoadOwnedStructs() {
        var _a;
        const struct = (_a = this.m_Room) === null || _a === void 0 ? void 0 : _a.find(FIND_MY_STRUCTURES);
        if (struct) {
            for (let s of struct) {
                this.LoadStructs(ObjectsInRoom_1.ObjectsInRoom.MY_STRUCTS, s.structureType, s.id);
            }
        }
    }
    LoadHostileStructs() {
        var _a;
        const structs = (_a = this.m_Room) === null || _a === void 0 ? void 0 : _a.find(FIND_HOSTILE_STRUCTURES);
        if (structs) {
            for (let hs of structs) {
                this.LoadStructs(ObjectsInRoom_1.ObjectsInRoom.HOSTILE_STRUCTS, hs.structureType, hs.id);
            }
        }
    }
    LoadUnownedStructs() {
        var _a;
        const structs = (_a = this.m_Room) === null || _a === void 0 ? void 0 : _a.find(FIND_STRUCTURES);
        if (structs) {
            for (let uos of structs) {
                if (!uos) {
                    console.log("found null struct");
                }
                else {
                    if (!this.IsOwned(uos) && !this.IsHostile(uos)) {
                        this.LoadStructs(ObjectsInRoom_1.ObjectsInRoom.UNOWNED_STRUCTS, uos.structureType, uos.id);
                    }
                }
            }
        }
    }
    LoadSources() {
        var _a;
        const sources = (_a = this.m_Room) === null || _a === void 0 ? void 0 : _a.find(FIND_SOURCES);
        if (sources) {
            for (let energy of sources) {
                this.LoadResources(ObjectsInRoom_1.ObjectsInRoom.SOURCES, energy.id);
            }
        }
    }
    LoadConstructionSites() {
        var _a;
        const sites = (_a = this.m_Room) === null || _a === void 0 ? void 0 : _a.find(FIND_MY_CONSTRUCTION_SITES);
        if (sites) {
            for (let site of sites) {
                this.LoadResources(ObjectsInRoom_1.ObjectsInRoom.MY_CONSTRUCTION_SITES, site.id);
            }
        }
    }
    LoadMyCreeps() {
        var _a;
        const creeps = (_a = this.m_Room) === null || _a === void 0 ? void 0 : _a.find(FIND_MY_CREEPS);
        if (creeps) {
            for (let creep of creeps) {
                this.LoadResources(ObjectsInRoom_1.ObjectsInRoom.MY_CREEPS, creep.id);
            }
        }
    }
    LoadHostileCreeps() {
        var _a;
        const hostile_creeps = (_a = this.m_Room) === null || _a === void 0 ? void 0 : _a.find(FIND_HOSTILE_CREEPS);
        if (hostile_creeps) {
            for (let creep of hostile_creeps) {
                this.LoadResources(ObjectsInRoom_1.ObjectsInRoom.HOSTILE_CREEPS, creep.id);
            }
        }
    }
    GetOwnerName(struct) {
        var _a;
        return (_a = struct.owner) === null || _a === void 0 ? void 0 : _a.username;
    }
    IsOwned(struct) {
        const struct_owner = this.GetOwnerName(struct);
        const string_type = typeof struct_owner === 'string';
        return Boolean(string_type && struct_owner === GameObjectConsts_1.Owner);
    }
    IsHostile(struct) {
        const struct_owner = this.GetOwnerName(struct);
        const string_type = typeof struct_owner === 'string';
        return Boolean(string_type && struct_owner !== GameObjectConsts_1.Owner);
    }
    GetStructures(struct_type, map) {
        const found_structs = new Array();
        if (map) {
            const list = map.get(struct_type);
            if (list) {
                for (var id of list) {
                    const struct_id = id;
                    const struct = Game.getObjectById(struct_id);
                    if (struct) {
                        found_structs.push(struct);
                    }
                }
            }
        }
        return found_structs;
    }
    GetResource(key) {
        const resource_objects = new Array();
        const resource_array = this.m_Room_objects.GetArray(key);
        if (resource_array) {
            for (var id of resource_array) {
                const resource_id = id;
                const resource = Game.getObjectById(resource_id);
                if (resource) {
                    resource_objects.push(resource);
                }
            }
        }
        return resource_objects;
    }
    GetOwnedStructures(struct_type) {
        const key = ObjectsInRoom_1.ObjectsInRoom.MY_STRUCTS;
        if (!this.m_Room_objects.Has(key)) {
            this.LoadOwnedStructs();
        }
        const map = this.m_Room_objects.GetMap(key);
        return this.GetStructures(struct_type, map);
    }
    GetHostileStructures(struct_type) {
        const key = ObjectsInRoom_1.ObjectsInRoom.HOSTILE_STRUCTS;
        if (!this.m_Room_objects.Has(key)) {
            this.LoadHostileStructs();
        }
        const map = this.m_Room_objects.GetMap(key);
        return this.GetStructures(struct_type, map);
    }
    GetUnownedStructures(struct_type) {
        const key = ObjectsInRoom_1.ObjectsInRoom.UNOWNED_STRUCTS;
        if (!this.m_Room_objects.Has(key)) {
            this.LoadUnownedStructs();
        }
        const map = this.m_Room_objects.GetMap(key);
        return this.GetStructures(struct_type, map);
    }
    GetAllNonHostileStructs(filter) {
        var _a;
        const struct_type_keys = [
            ObjectsInRoom_1.ObjectsInRoom.MY_STRUCTS,
            ObjectsInRoom_1.ObjectsInRoom.UNOWNED_STRUCTS
        ];
        const structs = new Array();
        for (let key of struct_type_keys) {
            if (!this.m_Room_objects.Has(key)) {
                switch (key) {
                    case ObjectsInRoom_1.ObjectsInRoom.MY_STRUCTS: {
                        this.LoadOwnedStructs();
                        break;
                    }
                    case ObjectsInRoom_1.ObjectsInRoom.UNOWNED_STRUCTS: {
                        this.LoadUnownedStructs();
                        break;
                    }
                }
            }
            (_a = this.m_Room_objects.GetMap(key)) === null || _a === void 0 ? void 0 : _a.forEach((value, key) => {
                for (let id of value) {
                    const struct_id = id;
                    const room_struct = Game.getObjectById(struct_id);
                    const is_filter = room_struct && filter && filter(room_struct);
                    const isnt_filter = room_struct && filter === undefined;
                    if (is_filter || isnt_filter) {
                        structs.push(room_struct);
                    }
                }
            });
        }
        return structs;
    }
    GetConstructionSites() {
        const key = ObjectsInRoom_1.ObjectsInRoom.MY_CONSTRUCTION_SITES;
        if (!this.m_Room_objects.Has(key)) {
            this.LoadConstructionSites();
        }
        return this.GetResource(key);
    }
    GetController() {
        const controller_list = this.GetOwnedStructures(STRUCTURE_CONTROLLER);
        let controller = null;
        if (controller_list.length > 0) {
            controller = controller_list[0];
        }
        return controller;
    }
    GetSources() {
        const key = ObjectsInRoom_1.ObjectsInRoom.SOURCES;
        if (!this.m_Room_objects.Has(key)) {
            this.LoadSources();
        }
        return this.GetResource(key);
    }
    GetMyCreeps() {
        const key = ObjectsInRoom_1.ObjectsInRoom.MY_CREEPS;
        if (!this.m_Room_objects.Has(key)) {
            this.LoadMyCreeps();
        }
        return this.GetResource(key);
    }
    GetHostileCreeps() {
        const key = ObjectsInRoom_1.ObjectsInRoom.HOSTILE_CREEPS;
        if (!this.m_Room_objects.Has(key)) {
            this.LoadHostileCreeps();
        }
        const whitelist = [
            "Zpike"
        ];
        const foreign_creeps = this.GetResource(key);
        const hostile_creep = new Array();
        for (let creep of foreign_creeps) {
            let is_enemy = true;
            for (let ally of whitelist) {
                if (creep.owner.username === ally) {
                    is_enemy = false;
                    break;
                }
            }
            if (is_enemy) {
                hostile_creep.push(creep);
            }
        }
        return hostile_creep;
    }
    GetEnergyCapacity() {
        const room = Game.rooms[this.m_Name];
        let total_energy = -1;
        if (room) {
            total_energy = room.energyCapacityAvailable;
        }
        return total_energy;
    }
    GetEnergyStored() {
        const room = Game.rooms[this.m_Name];
        let stored_energy = -1;
        if (room) {
            stored_energy = room.energyAvailable;
        }
        return stored_energy;
    }
    GetName() {
        return this.m_Name;
    }
}
exports.RoomWrapper = RoomWrapper;
