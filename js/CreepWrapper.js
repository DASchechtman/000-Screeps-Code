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
exports.CreepWrapper = void 0;
var Consts_1 = require("./Consts");
var HardDrive_1 = require("./HardDrive");
var GameObject_1 = require("./GameObject");
var SignalManager_1 = require("./SignalManager");
var BuildBehavior_1 = require("./BuildBehavior");
var CreepTypes_1 = require("./CreepTypes");
var DefendBehavior_1 = require("./DefendBehavior");
var HarvestBehavior_1 = require("./HarvestBehavior");
var UpgradeBehavior_1 = require("./UpgradeBehavior");
var CreepWrapper = /** @class */ (function (_super) {
    __extends(CreepWrapper, _super);
    function CreepWrapper(name, room) {
        var _this = _super.call(this, name, Consts_1.CREEP_TYPE) || this;
        console.log("adding to queue");
        _this.m_Creep_name = name;
        CreepWrapper.behavior_types = new Map();
        _this.m_Behavior = null;
        _this.m_Room = room;
        _this.m_Creep = Game.creeps[name];
        _this.m_Cur_type = -1;
        return _this;
    }
    CreepWrapper.prototype.LoadTypes = function () {
        if (CreepWrapper.behavior_types.size === 0) {
            CreepWrapper.behavior_types.set(CreepTypes_1.HARVEST_TYPE, new HarvestBehavior_1.HarvestBehavior());
            CreepWrapper.behavior_types.set(CreepTypes_1.BUILDER_TYPE, new BuildBehavior_1.BuildBehavior());
            CreepWrapper.behavior_types.set(CreepTypes_1.DEFENDER_TYPE, new DefendBehavior_1.DefendBehavior());
            CreepWrapper.behavior_types.set(CreepTypes_1.UPGRADER_TYPE, new UpgradeBehavior_1.UpgradeBehavior());
        }
    };
    CreepWrapper.prototype.SendRemoveNameSignal = function () {
        var _a;
        var filter = function (sender, other) {
            var is_right = false;
            var creeper = signal.from;
            var type = other.SignalRecieverType();
            var id = other.SignalRecieverID();
            if (type === Consts_1.COLONY_TYPE && id === creeper.GetRoomName()) {
                is_right = true;
            }
            return is_right;
        };
        var task = (_a = this.m_Behavior) === null || _a === void 0 ? void 0 : _a.SignalTask();
        if (!task) {
            task = function (sender, reciever) {
                var creep = sender.from;
                reciever.RemoveFromMemory(creep.GetName());
                return true;
            };
        }
        var signal = {
            from: this,
            data: this.m_Room.GetName(),
            method: task
        };
        SignalManager_1.SignalManager.Inst().SendSignal(signal, filter);
    };
    CreepWrapper.prototype.OnLoad = function () {
        this.LoadTypes();
        console.log("loading type: " + this.m_Cur_type);
        this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
        if (this.m_Creep) {
            var data = HardDrive_1.HardDrive.Read(this.m_Creep.name);
            var behavior = data.type;
            if (behavior) {
                this.m_Cur_type = behavior;
                this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
            }
        }
        else {
            var data = HardDrive_1.HardDrive.Read(this.m_Creep_name);
            var behavior = data.type;
            if (behavior) {
                this.m_Behavior = CreepWrapper.behavior_types.get(behavior);
            }
        }
    };
    CreepWrapper.prototype.OnRun = function () {
        console.log("running");
        if (this.m_Creep && this.m_Behavior) {
            this.m_Behavior.Load(this.m_Creep);
            this.m_Behavior.Behavior(this.m_Creep, this.m_Room);
            this.m_Behavior.Save(this.m_Creep);
        }
        else {
            HardDrive_1.HardDrive.Erase(this.m_Creep_name);
            this.SendRemoveNameSignal();
        }
    };
    CreepWrapper.prototype.OnSave = function () {
        var data = HardDrive_1.HardDrive.Read(this.m_Creep_name);
        data.type = this.m_Cur_type;
        HardDrive_1.HardDrive.Write(this.m_Creep_name, data);
    };
    CreepWrapper.prototype.OnInvasion = function () {
        this.m_Behavior = CreepWrapper.behavior_types.get(CreepTypes_1.DEFENDER_TYPE);
    };
    CreepWrapper.prototype.SetType = function (new_type) {
        this.LoadTypes();
        if (CreepWrapper.behavior_types.has(new_type)) {
            console.log("setting type to: " + new_type);
            this.m_Cur_type = new_type;
            this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
        }
    };
    CreepWrapper.prototype.GetName = function () {
        return this.m_Creep_name;
    };
    CreepWrapper.prototype.GetRoomName = function () {
        return this.m_Room.GetName();
    };
    CreepWrapper.prototype.HasBehavior = function () {
        return Boolean(this.m_Behavior);
    };
    return CreepWrapper;
}(GameObject_1.GameObject));
exports.CreepWrapper = CreepWrapper;
