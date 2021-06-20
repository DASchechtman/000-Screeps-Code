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
var Colony = /** @class */ (function (_super) {
    __extends(Colony, _super);
    function Colony(room_name) {
        var _this = _super.call(this, room_name, Consts_1.COLONY_TYPE) || this;
        _this.m_Room = new RoomWrapper_1.RoomWrapper(room_name);
        _this.m_Colony_queen = _this.m_Room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
        _this.m_Creeps_count = 0;
        _this.m_Creep_cap = 10;
        _this.m_Being_invaded = false;
        _this.m_Creep_types = new Stack_1.Stack();
        _this.m_Creeps_name_data = {};
        _this.m_Data_key = "creeps";
        _this.m_Creeps = new Array();
        return _this;
    }
    Colony.prototype.SpawnCreep = function () {
        var _a, _b, _c;
        var type = this.m_Creep_types.Peek();
        if (type !== null) {
            var name_1 = "creep-" + new Date().getTime();
            var creation = void 0;
            var energy = this.m_Room.GetEnergyCapacity();
            var body = CreepBuilder_1.CreepBuilder.WORKER_BODY;
            if (type === CreepTypes_1.DEFENDER_TYPE) {
                body = CreepBuilder_1.CreepBuilder.DEFENDER_BODY;
                creation = (_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawnCreep(CreepBuilder_1.CreepBuilder.BuildScalableDefender(energy), name_1);
            }
            else {
                creation = (_b = this.m_Colony_queen) === null || _b === void 0 ? void 0 : _b.spawnCreep(CreepBuilder_1.CreepBuilder.BuildScalableWorker(energy), name_1);
            }
            if (creation === ERR_NOT_ENOUGH_ENERGY) {
                creation = (_c = this.m_Colony_queen) === null || _c === void 0 ? void 0 : _c.spawnCreep(body, name_1);
            }
            if (creation === OK) {
                console.log("adding name");
                this.m_Creeps_name_data[this.m_Data_key].push(name_1);
                this.m_Creeps_count++;
                var creep_wrap = new CreepWrapper_1.CreepWrapper(name_1, this.m_Room);
                creep_wrap.SetType(type);
                this.m_Creep_types.Pop();
                this.m_Creeps.push(creep_wrap);
            }
        }
    };
    Colony.prototype.LoadBuilderTypes = function () {
        var sites = this.m_Room.GetConstructionSites();
        if (sites.length > 0) {
            var builders = Math.floor(sites.length / 25);
            if (builders === 0) {
                builders = 1;
            }
            if (sites.length + builders > this.m_Creep_cap) {
                builders = sites.length + builders - this.m_Creep_cap;
            }
            for (var i = 0; i < builders; i++) {
                this.m_Creep_types.Push(CreepTypes_1.BUILDER_TYPE);
            }
        }
    };
    Colony.prototype.LoadDefenderTypes = function () {
        var enemies = this.m_Room.GetHostileCreeps();
        if (enemies.length > 0) {
            if (enemies.length + this.m_Creep_types.Size() > this.m_Creep_cap) {
                this.m_Creep_cap = enemies.length + this.m_Creep_types.Size();
            }
            for (var i = 0; i < enemies.length; i++) {
                this.m_Creep_types.Push(CreepTypes_1.DEFENDER_TYPE);
            }
        }
    };
    Colony.prototype.LoadTypes = function () {
        this.m_Creep_types.Push(CreepTypes_1.HARVEST_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.HARVEST_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.UPGRADER_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.UPGRADER_TYPE);
        this.LoadDefenderTypes();
        this.LoadBuilderTypes();
        while (this.m_Creep_types.Size() < this.m_Creep_cap) {
            this.m_Creep_types.Push(CreepTypes_1.HARVEST_TYPE);
        }
    };
    Colony.prototype.IsInvaded = function () {
        return this.m_Room.GetHostileCreeps().length > 0;
    };
    Colony.prototype.OnLoad = function () {
        var _a, _b;
        this.LoadTypes();
        var data = HardDrive_1.HardDrive.Read(this.m_Room.GetName());
        if (data[this.m_Data_key]) {
            this.m_Creeps_name_data[this.m_Data_key] = data[this.m_Data_key];
        }
        else {
            this.m_Creeps_name_data[this.m_Data_key] = new Array();
        }
        for (var _i = 0, _c = this.m_Creeps_name_data[this.m_Data_key]; _i < _c.length; _i++) {
            var creep_name = _c[_i];
            if (creep_name !== ((_b = (_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawning) === null || _b === void 0 ? void 0 : _b.name)) {
                console.log("creating new creep");
                this.m_Creeps.push(new CreepWrapper_1.CreepWrapper(creep_name, this.m_Room));
                this.m_Creep_types.Pop();
                this.m_Creeps_count++;
            }
        }
    };
    Colony.prototype.OnRun = function () {
        if (this.m_Colony_queen) {
            if (this.m_Creeps_count < this.m_Creep_cap) {
                this.SpawnCreep();
            }
        }
    };
    Colony.prototype.OnSave = function () {
        HardDrive_1.HardDrive.Write(this.m_Room.GetName(), this.m_Creeps_name_data);
    };
    Colony.prototype.RemoveFromMemory = function (name) {
        var creep_names = this.m_Creeps_name_data[this.m_Data_key];
        var index = creep_names.indexOf(name);
        if (index > -1) {
            creep_names.splice(index, 1);
        }
    };
    Colony.prototype.ResetBehaviors = function () {
        this.m_Creep_types.Clear();
        this.LoadTypes();
        for (var _i = 0, _a = this.m_Creeps; _i < _a.length; _i++) {
            var creep = _a[_i];
            var type = this.m_Creep_types.Pop();
            if (type) {
                creep.SetType(type);
            }
        }
    };
    return Colony;
}(GameObject_1.GameObject));
exports.Colony = Colony;
