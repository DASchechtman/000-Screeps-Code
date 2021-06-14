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
var GameObject_1 = require("./GameObject");
var BuildBehavior_1 = require("./BuildBehavior");
var CreepTypes_1 = require("./CreepTypes");
var DefendBehavior_1 = require("./DefendBehavior");
var HarvestBehavior_1 = require("./HarvestBehavior");
var UpgradeBehavior_1 = require("./UpgradeBehavior");
var CreepWrapper = /** @class */ (function (_super) {
    __extends(CreepWrapper, _super);
    function CreepWrapper(id, room) {
        var _this = _super.call(this) || this;
        _this.m_Cur_type = CreepTypes_1.HARVEST_TYPE;
        _this.m_Creep_name = id;
        CreepWrapper.behavior_types = new Map();
        _this.m_Behavior = null;
        _this.m_Is_alive = true;
        _this.m_Room = room;
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
    CreepWrapper.prototype.OnLoad = function () {
        this.LoadTypes();
        this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
    };
    CreepWrapper.prototype.OnRun = function () {
        this.Act();
    };
    CreepWrapper.prototype.OnSave = function () { };
    CreepWrapper.prototype.SetType = function (new_type) {
        this.LoadTypes();
        if (CreepWrapper.behavior_types.has(new_type)) {
            this.m_Cur_type = new_type;
            this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
        }
    };
    CreepWrapper.prototype.Act = function () {
        var creep = Game.creeps[this.m_Creep_name];
        if (creep && this.m_Behavior) {
            this.m_Behavior.Load(creep);
            this.m_Behavior.Behavior(creep, this.m_Room);
            this.m_Behavior.Save(creep);
            if (creep.ticksToLive === 1) {
                this.m_Behavior.Destroy(creep);
            }
        }
        else {
            this.m_Is_alive = false;
        }
        return this.m_Is_alive;
    };
    CreepWrapper.prototype.GetName = function () {
        return this.m_Creep_name;
    };
    CreepWrapper.prototype.HasBehavior = function () {
        return Boolean(this.m_Behavior);
    };
    CreepWrapper.prototype.IsAlive = function () {
        return this.m_Is_alive;
    };
    return CreepWrapper;
}(GameObject_1.GameObject));
exports.CreepWrapper = CreepWrapper;
