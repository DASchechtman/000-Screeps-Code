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
var CreepTypes_1 = require("../Creep/CreepTypes");
var CreepWrapper_1 = require("../Creep/CreepWrapper");
var Stack_1 = require("../DataStructures/Stack");
var GameObject_1 = require("../Events/GameObject");
var RoomWrapper_1 = require("../Room/RoomWrapper");
var Colony = /** @class */ (function (_super) {
    __extends(Colony, _super);
    function Colony(room_name) {
        var _this = _super.call(this) || this;
        _this.m_Room = new RoomWrapper_1.RoomWrapper(room_name);
        _this.m_Colony_queen = _this.m_Room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
        _this.m_Creeps_count = 0;
        _this.m_Creep_types = new Stack_1.Stack();
        return _this;
    }
    Colony.prototype.SpawnCreep = function () {
        var _a;
        var name = "creep-" + new Date().getTime();
        var creation = (_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawnCreep([WORK, MOVE, CARRY], name);
        if (creation === OK) {
            this.m_Creeps_count++;
            var type = this.m_Creep_types.Pop();
            var creep_wrap = new CreepWrapper_1.CreepWrapper(name, this.m_Room);
            if (type !== null) {
                creep_wrap.SetType(type);
            }
        }
    };
    Colony.prototype.OnLoad = function () {
        this.m_Creep_types.Push(CreepTypes_1.HARVEST_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.HARVEST_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.HARVEST_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.HARVEST_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.HARVEST_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.UPGRADER_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.UPGRADER_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.UPGRADER_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.UPGRADER_TYPE);
        this.m_Creep_types.Push(CreepTypes_1.UPGRADER_TYPE);
        for (var _i = 0, _a = this.m_Room.GetMyCreeps(); _i < _a.length; _i++) {
            var creep = _a[_i];
            var type = this.m_Creep_types.Pop();
            var creep_wrap = new CreepWrapper_1.CreepWrapper(creep.name, this.m_Room);
            if (type !== null) {
                creep_wrap.SetType(type);
            }
            this.m_Creeps_count++;
        }
    };
    Colony.prototype.OnRun = function () {
        if (this.m_Colony_queen) {
            if (this.m_Creeps_count < 10) {
                this.SpawnCreep();
            }
        }
    };
    return Colony;
}(GameObject_1.GameObject));
exports.Colony = Colony;
