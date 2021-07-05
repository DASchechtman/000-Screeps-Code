"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepBehavior = void 0;
var HardDrive_1 = require("./HardDrive");
var CreepBehavior = /** @class */ (function () {
    function CreepBehavior() {
    }
    CreepBehavior.prototype.ClearDiskData = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    CreepBehavior.prototype.Signal = function (signal, creep) {
        return false;
    };
    CreepBehavior.prototype.MoveTo = function (result, creep, location) {
        var perform = result === ERR_NOT_IN_RANGE;
        if (perform) {
            creep.moveTo(location);
        }
        return !perform;
    };
    CreepBehavior.prototype.Harvest = function (creep, source) {
        this.MoveTo(creep.harvest(source), creep, source);
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
