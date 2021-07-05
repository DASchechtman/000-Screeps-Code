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
var GameObjectConsts_1 = require("./GameObjectConsts");
var HardDrive_1 = require("./HardDrive");
var GameObject_1 = require("./GameObject");
var SignalManager_1 = require("./SignalManager");
var BuildBehavior_1 = require("./BuildBehavior");
var CreepBehaviorConsts_1 = require("./CreepBehaviorConsts");
var DefendBehavior_1 = require("./DefendBehavior");
var HarvestBehavior_1 = require("./HarvestBehavior");
var UpgradeBehavior_1 = require("./UpgradeBehavior");
var RepairBehavior_1 = require("./RepairBehavior");
/*
Class meant to extend functionaliyt of creep, provides fuctions like
telling when creep dies
givig creep more flexible behavior
*/
var CreepWrapper = /** @class */ (function (_super) {
    __extends(CreepWrapper, _super);
    function CreepWrapper(name, room) {
        var _this = _super.call(this, name, GameObjectConsts_1.CREEP_TYPE) || this;
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
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.HARVEST_BEHAVIOR, new HarvestBehavior_1.HarvestBehavior());
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.BUILDER_BEHAVIOR, new BuildBehavior_1.BuildBehavior());
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR, new DefendBehavior_1.DefendBehavior());
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR, new UpgradeBehavior_1.UpgradeBehavior());
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.REPAIR_BEHAVIOR, new RepairBehavior_1.RepairBehavior());
        }
    };
    CreepWrapper.prototype.SendRemoveNameSignal = function () {
        var signal = {
            from: this,
            data: { name: this.GetName() },
            filter: function (sender, other) {
                var is_right = false;
                var creeper = sender.from;
                var type = other.SignalRecieverType();
                var id = other.SignalRecieverID();
                if (type === GameObjectConsts_1.COLONY_TYPE && id === creeper.GetRoomName()) {
                    is_right = true;
                }
                return is_right;
            },
            method: function (sender, reciever) {
                reciever.RemoveFromMemory(sender.data.name);
                return true;
            }
        };
        SignalManager_1.SignalManager.Inst().SendSignal(signal);
    };
    CreepWrapper.prototype.OnLoad = function () {
        this.LoadTypes();
        if (this.m_Creep) {
            var data = HardDrive_1.HardDrive.Read(this.m_Creep.name);
            var behavior = data.type;
            if (typeof behavior === 'number') {
                this.m_Cur_type = behavior;
                this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
            }
        }
    };
    CreepWrapper.prototype.OnRun = function () {
        if (this.m_Creep && this.m_Behavior) {
            this.m_Behavior.Load(this.m_Creep);
            this.m_Behavior.Run(this.m_Creep, this.m_Room);
            this.m_Behavior.Save(this.m_Creep);
        }
        else {
            HardDrive_1.HardDrive.Erase(this.m_Creep_name);
            this.SendRemoveNameSignal();
        }
    };
    CreepWrapper.prototype.OnSave = function () {
        if (this.m_Creep) {
            var data = HardDrive_1.HardDrive.Read(this.m_Creep_name);
            data.type = this.m_Cur_type;
            HardDrive_1.HardDrive.Write(this.m_Creep_name, data);
        }
    };
    CreepWrapper.prototype.OnInvasion = function () {
        this.m_Behavior = CreepWrapper.behavior_types.get(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR);
    };
    CreepWrapper.prototype.OnSignal = function (signal) {
        var ret = true;
        if (signal.method) {
            ret = signal.method(signal, this);
        }
        else if (this.m_Behavior) {
            ret = this.m_Behavior.Signal(signal, this);
        }
        return ret;
    };
    CreepWrapper.prototype.SetBehavior = function (new_type) {
        this.LoadTypes();
        if (CreepWrapper.behavior_types.has(new_type)) {
            this.m_Cur_type = new_type;
            this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
        }
    };
    CreepWrapper.prototype.GetBehavior = function () {
        return this.m_Cur_type;
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
