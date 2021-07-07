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
exports.RepairBehavior = void 0;
var CreepBehaviorConsts_1 = require("../../Constants/CreepBehaviorConsts");
var StructuresStack_1 = require("../../DataStructures/StructuresStack");
var HardDrive_1 = require("../../Disk/HardDrive");
var CreepBehavior_1 = require("./CreepBehavior");
var RepairBehavior = /** @class */ (function (_super) {
    __extends(RepairBehavior, _super);
    function RepairBehavior() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.m_Data = {};
        _this.m_Struct_Stack = new StructuresStack_1.StructuresStack();
        _this.m_Max_time = 10;
        return _this;
    }
    RepairBehavior.prototype.Load = function (creep) {
        var data_behavior = this.GetBehavior(creep);
        var cur_state = Boolean(data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.full);
        var cur_tick = typeof (data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.tick) === 'number' ? data_behavior.tick : 0;
        var new_id = data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.new_id;
        var source_id = String(data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.source_id);
        if (new_id === undefined) {
            new_id = true;
        }
        this.m_Data = {
            id: String(data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.id),
            full: this.UpdateWorkState(creep, cur_state),
            tick: cur_tick,
            new_id: new_id,
            source_id: source_id
        };
    };
    RepairBehavior.prototype.Run = function (creep, room) {
        var source = Game.getObjectById(this.m_Data.source_id);
        if (this.m_Data.full) {
            var id = this.SetStruct();
            var struct = Game.getObjectById(id);
            if (struct) {
                this.Repair(creep, struct);
            }
            else {
                creep.suicide();
            }
        }
        else {
            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES);
            }
            if (source) {
                this.m_Data.source_id = source.id;
                this.Harvest(creep, source);
            }
        }
    };
    RepairBehavior.prototype.Save = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        data.behavior = this.m_Data;
        HardDrive_1.HardDrive.Write(creep.name, data);
    };
    RepairBehavior.prototype.Signal = function (signal) {
        this.m_Struct_Stack.Add(signal.from);
        return true;
    };
    RepairBehavior.prototype.Repair = function (creep, struct) {
        if (!this.MoveTo(CreepBehaviorConsts_1.REPAIR_DISTANCE, creep, struct)) {
            creep.repair(struct);
            this.IncCounter();
        }
    };
    RepairBehavior.prototype.IncCounter = function () {
        this.m_Data.tick = this.m_Data.tick + 1;
        if (this.m_Data.tick === this.m_Max_time) {
            this.m_Data.tick = 0;
            this.m_Data.new_id = true;
        }
    };
    RepairBehavior.prototype.SetStruct = function () {
        var _a;
        var id = this.m_Data.id;
        if (this.m_Data.new_id) {
            var struct_wrapper = this.m_Struct_Stack.Pop();
            if (struct_wrapper) {
                var new_id = String((_a = struct_wrapper.GetStructure()) === null || _a === void 0 ? void 0 : _a.id);
                this.m_Data.id = new_id;
                id = new_id;
            }
            this.m_Data.new_id = false;
        }
        return id;
    };
    return RepairBehavior;
}(CreepBehavior_1.CreepBehavior));
exports.RepairBehavior = RepairBehavior;
