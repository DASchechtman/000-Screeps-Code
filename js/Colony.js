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
var Consts_1 = require("./Consts");
var CreepBuilder_1 = require("./CreepBuilder");
var CreepTypes_1 = require("./CreepTypes");
var CreepWrapper_1 = require("./CreepWrapper");
var Stack_1 = require("./Stack");
var HardDrive_1 = require("./HardDrive");
var GameObject_1 = require("./GameObject");
var RoomWrapper_1 = require("./RoomWrapper");
var SignalManager_1 = require("./SignalManager");
var CreepTypeQueue_1 = require("./CreepTypeQueue");
var CreepTypeTracker_1 = require("./CreepTypeTracker");
var Colony = /** @class */ (function (_super) {
    __extends(Colony, _super);
    function Colony(room_name) {
        var _this = _super.call(this, room_name, Consts_1.COLONY_TYPE) || this;
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
    Colony.prototype.SpawnCreep = function () {
        var _a, _b;
        var type = this.m_Creep_types.Peek();
        if (type !== null) {
            var name_1 = "creep-" + Date.now();
            var creation = void 0;
            var energy = this.m_Room.GetEnergyCapacity();
            var body_type = CreepBuilder_1.CreepBuilder.WORKER_BODY;
            if (type === CreepTypes_1.DEFENDER_TYPE) {
                body_type = CreepBuilder_1.CreepBuilder.DEFENDER_BODY;
                var defender_body = CreepBuilder_1.CreepBuilder.BuildScalableDefender(energy);
                creation = (_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawnCreep(defender_body, name_1);
            }
            else {
                var worker_body = CreepBuilder_1.CreepBuilder.BuildScalableWorker(energy);
                creation = (_b = this.m_Colony_queen) === null || _b === void 0 ? void 0 : _b.spawnCreep(worker_body, name_1);
            }
            if (creation === OK) {
                this.GetCreepNames().push(name_1);
                this.m_Creeps_count++;
                var creep_wrap = new CreepWrapper_1.CreepWrapper(name_1, this.m_Room);
                creep_wrap.SetBehavior(type);
                this.m_Creep_types.Pop();
                this.m_Creeps.push(creep_wrap);
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
        var _loop_1 = function (level) {
            var count = this_1.m_Type_tracker.GetLevelCount(level);
            console.log("count: " + count);
            if (count > 0) {
                var names_1 = this_1.m_Type_tracker.GetNamesByLevel(level);
                console.log("level: " + level);
                var filter = function (sender, other) {
                    return other.SignalRecieverID() === names_1[0];
                };
                var signal = {
                    from: this_1,
                    data: null,
                    method: function (sender, reciever) {
                        var creep = reciever;
                        _this.m_Type_tracker.Remove(creep.GetBehavior(), creep.GetName());
                        creep.SetBehavior(CreepTypes_1.HARVEST_TYPE);
                        _this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName());
                        console.log("converting to harvester");
                        return true;
                    }
                };
                SignalManager_1.SignalManager.Inst().SendSignal(signal, filter);
                return "break";
            }
        };
        var this_1 = this;
        for (var _i = 0, creep_levels_1 = creep_levels; _i < creep_levels_1.length; _i++) {
            var level = creep_levels_1[_i];
            var state_1 = _loop_1(level);
            if (state_1 === "break")
                break;
        }
    };
    Colony.prototype.OnLoad = function () {
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
    Colony.prototype.OnRun = function () {
        if (this.m_Colony_queen) {
            for (var _i = 0, _a = this.m_Creeps; _i < _a.length; _i++) {
                var creep = _a[_i];
                this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName());
            }
            var harvester_count = this.m_Type_tracker.GetTypeCount(CreepTypes_1.HARVEST_TYPE);
            var max = this.m_Type_queue.GetMax(CreepTypes_1.HARVEST_TYPE);
            if (max !== -1 && harvester_count < max) {
                this.ConvertToHarvester();
            }
            this.m_Creep_types = this.m_Type_queue.CreateStack(this.m_Type_tracker);
            if (this.m_Creep_types.Size() > 0) {
                this.SpawnCreep();
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
