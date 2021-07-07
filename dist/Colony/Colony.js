"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colony = void 0;
var GameObjectConsts_1 = require("../Constants/GameObjectConsts");
var CreepBuilder_1 = require("../Creep/CreepBuilder");
var CreepBehaviorConsts_1 = require("../Constants/CreepBehaviorConsts");
var CreepWrapper_1 = require("../Creep/CreepWrapper");
var Stack_1 = require("../DataStructures/Stack");
var HardDrive_1 = require("../Disk/HardDrive");
var GameObject_1 = require("../GameObject");
var RoomWrapper_1 = require("../Room/RoomWrapper");
var SignalManager_1 = require("../Signals/SignalManager");
var CreepTypeQueue_1 = require("./CreepTypeQueue");
var CreepTypeTracker_1 = require("./CreepTypeTracker");
var StructureWrapper_1 = require("../Structure/StructureWrapper");
var TimedStructureWrapper_1 = require("../Structure/TimedStructureWrapper");
var BehaviorStructureWrapper_1 = require("../Structure/BehaviorStructureWrapper");
var Colony = /** @class */ (function (_super) {
    __extends(Colony, _super);
    function Colony(room_name) {
        var _this = _super.call(this, room_name, GameObjectConsts_1.COLONY_TYPE) || this;
        _this.m_Room = new RoomWrapper_1.RoomWrapper(room_name);
        _this.m_Colony_queen = _this.m_Room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
        _this.m_Creeps_count = 0;
        _this.m_Creep_cap = 10;
        _this.m_Creep_types = new Stack_1.Stack();
        _this.m_Creeps_list = {};
        _this.m_Data_key = "creeps";
        _this.m_Creeps = new Array();
        _this.m_Type_tracker = new CreepTypeTracker_1.CreepTypeTracker();
        _this.m_Type_queue = new CreepTypeQueue_1.CreepTypeQueue(_this.m_Room);
        return _this;
    }
    Colony.prototype.GetCreepNames = function () {
        var data = HardDrive_1.HardDrive.Read(this.m_Room.GetName());
        if (data[this.m_Data_key]) {
            this.m_Creeps_list[this.m_Data_key] = data[this.m_Data_key];
        }
        else if (!this.m_Creeps_list[this.m_Data_key]) {
            this.m_Creeps_list[this.m_Data_key] = new Array();
        }
        return this.m_Creeps_list[this.m_Data_key];
    };
    Colony.prototype.SpawnCreep = function (type, name) {
        var _a, _b;
        var created = false;
        var energy_capactiy = this.m_Room.GetEnergyCapacity();
        var energy_stored = this.m_Room.GetEnergyStored();
        var body;
        if (type === CreepBehaviorConsts_1.DEFENDER_BEHAVIOR) {
            body = CreepBuilder_1.CreepBuilder.BuildScalableDefender(energy_capactiy);
        }
        else {
            body = CreepBuilder_1.CreepBuilder.BuildScalableWorker(energy_capactiy);
        }
        var body_energy_cost = CreepBuilder_1.CreepBuilder.GetBodyCost(body);
        if (body_energy_cost <= energy_stored && !((_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawning)) {
            (_b = this.m_Colony_queen) === null || _b === void 0 ? void 0 : _b.spawnCreep(body, name);
            created = true;
        }
        return created;
    };
    Colony.prototype.CreateCreep = function (name, type) {
        var creep = new CreepWrapper_1.CreepWrapper(name, this.m_Room);
        creep.SetBehavior(type);
        return creep;
    };
    Colony.prototype.PushCreepAndNameToLists = function (creep) {
        this.m_Creeps.push(creep);
        this.GetCreepNames().push(creep.GetName());
    };
    Colony.prototype.UpdateData = function () {
        this.m_Creeps_count++;
        this.m_Creep_types.Pop();
    };
    Colony.prototype.SpawnColonyMember = function () {
        var type = this.m_Creep_types.Peek();
        if (typeof type === 'number') {
            var name_1 = "creep-" + Date.now();
            var spawned = this.SpawnCreep(type, name_1);
            if (spawned) {
                var creep_wrap = this.CreateCreep(name_1, type);
                this.PushCreepAndNameToLists(creep_wrap);
                this.UpdateData();
                this.m_Type_tracker.Add(creep_wrap.GetBehavior(), creep_wrap.GetName());
            }
        }
    };
    Colony.prototype.ConvertToHarvester = function () {
        var _this = this;
        var creep_levels = [
            CreepTypeTracker_1.CreepTypeTracker.LEVEL_THREE,
            CreepTypeTracker_1.CreepTypeTracker.LEVEL_TWO
        ];
        for (var _i = 0, creep_levels_1 = creep_levels; _i < creep_levels_1.length; _i++) {
            var level = creep_levels_1[_i];
            var count = this.m_Type_tracker.GetLevelCount(level);
            if (count > 0) {
                var names = this.m_Type_tracker.GetNamesByLevel(level);
                var signal = {
                    from: this,
                    data: {
                        obj_type: GameObjectConsts_1.CREEP_TYPE,
                        creep_type: CreepBehaviorConsts_1.HARVEST_BEHAVIOR,
                        name: names[0]
                    },
                    filter: function (sender, other) {
                        var is_creep = other.SignalRecieverType() === sender.data.obj_type;
                        var same_name = other.SignalRecieverID() === sender.data.name;
                        return is_creep && same_name;
                    },
                    method: function (sender, reciever) {
                        var creep = reciever;
                        HardDrive_1.HardDrive.Erase(creep.GetName());
                        _this.m_Type_tracker.Remove(creep.GetBehavior(), creep.GetName());
                        creep.SetBehavior(sender.data.creep_type);
                        _this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName());
                        return true;
                    }
                };
                SignalManager_1.SignalManager.Inst().SendSignal(signal);
                break;
            }
        }
    };
    Colony.prototype.OnLoadCreeps = function () {
        var _a, _b;
        var creep_names = this.GetCreepNames();
        for (var _i = 0, creep_names_1 = creep_names; _i < creep_names_1.length; _i++) {
            var creep_name = creep_names_1[_i];
            if (creep_name !== ((_b = (_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawning) === null || _b === void 0 ? void 0 : _b.name)) {
                var wrapper = new CreepWrapper_1.CreepWrapper(creep_name, this.m_Room);
                this.m_Creeps.push(wrapper);
                this.m_Creeps_count++;
            }
        }
    };
    Colony.prototype.OnLoadStructs = function () {
        var structs = this.m_Room.GetAllNonHostileStructs();
        for (var _i = 0, structs_1 = structs; _i < structs_1.length; _i++) {
            var s = structs_1[_i];
            switch (s.structureType) {
                case STRUCTURE_ROAD:
                case STRUCTURE_RAMPART: {
                    new TimedStructureWrapper_1.TimedStructureWrapper(s.id);
                    break;
                }
                case STRUCTURE_TOWER:
                case STRUCTURE_LINK: {
                    new BehaviorStructureWrapper_1.BehaviorStructureWrapper(s.id);
                    break;
                }
                default: {
                    new StructureWrapper_1.StructureWrapper(s.id);
                    break;
                }
            }
        }
    };
    Colony.prototype.OnLoad = function () {
        this.OnLoadCreeps();
        this.OnLoadStructs();
    };
    Colony.prototype.OnRun = function () {
        if (this.m_Colony_queen) {
            for (var _i = 0, _a = this.m_Creeps; _i < _a.length; _i++) {
                var creep = _a[_i];
                this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName());
            }
            var harvester_count = this.m_Type_tracker.GetTypeCount(CreepBehaviorConsts_1.HARVEST_BEHAVIOR);
            var max = this.m_Type_queue.GetMax(CreepBehaviorConsts_1.HARVEST_BEHAVIOR);
            if (max !== -1 && harvester_count < max) {
                this.ConvertToHarvester();
            }
            this.m_Creep_types = this.m_Type_queue.CreateStack(this.m_Type_tracker);
            if (this.m_Creep_types.Size() > 0) {
                this.SpawnColonyMember();
            }
        }
    };
    Colony.prototype.OnSave = function () {
        HardDrive_1.HardDrive.Write(this.m_Room.GetName(), this.m_Creeps_list);
    };
    Colony.prototype.RemoveFromMemory = function (name) {
        var creep_names = this.m_Creeps_list[this.m_Data_key];
        var index = creep_names.indexOf(name);
        if (index > -1) {
            creep_names.splice(index, 1);
        }
    };
    return Colony;
}(GameObject_1.GameObject));
exports.Colony = Colony;
