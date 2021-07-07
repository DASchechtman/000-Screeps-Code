"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepBehavior = void 0;
var HardDrive_1 = require("../../Disk/HardDrive");
var CreepBehaviorConsts_1 = require("../../Constants/CreepBehaviorConsts");
var CreepBehavior = /** @class */ (function () {
    function CreepBehavior() {
    }
    CreepBehavior.prototype.ClearDiskData = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    CreepBehavior.prototype.Signal = function (signal, creep) {
        return false;
    };
    CreepBehavior.prototype.MoveTo = function (distance, creep, location) {
        var pos_x;
        var pos_y;
        if (location instanceof RoomPosition) {
            pos_x = location.x;
            pos_y = location.y;
        }
        else {
            pos_x = location.pos.x;
            pos_y = location.pos.y;
        }
        var abs_x = Math.abs(creep.pos.x - pos_x);
        var abs_y = Math.abs(creep.pos.y - pos_y);
        var move_x = abs_x > distance;
        var move_y = abs_y > distance;
        var move = move_x || move_y;
        if (move) {
            creep.moveTo(pos_x, pos_y);
        }
        return move;
    };
    CreepBehavior.prototype.Harvest = function (creep, source) {
        if (!this.MoveTo(CreepBehaviorConsts_1.HARVEST_DISTANCE, creep, source)) {
            creep.harvest(source);
        }
    };
    CreepBehavior.prototype.UpdateWorkState = function (creep, cur_state) {
        var resource_type = RESOURCE_ENERGY;
        var used_cap = creep.store.getUsedCapacity(resource_type);
        var max_cap = creep.store.getCapacity(resource_type);
        var state = cur_state;
        if (used_cap === 0) {
            state = false;
        }
        else if (used_cap === max_cap) {
            state = true;
        }
        return state;
    };
    CreepBehavior.prototype.GetBehavior = function (creep) {
        return HardDrive_1.HardDrive.Read(creep.name).behavior;
    };
    return CreepBehavior;
}());
exports.CreepBehavior = CreepBehavior;
