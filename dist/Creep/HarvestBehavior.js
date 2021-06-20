"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarvestBehavior = void 0;
var HardDrive_1 = require("../Disk/HardDrive");
var HarvestBehavior = /** @class */ (function () {
    function HarvestBehavior() {
        this.m_Source_id = "";
    }
    HarvestBehavior.prototype.SignalTask = function () {
        return function (signal, obj) {
            var creep = signal.from;
            obj.ResetBehaviors();
            return true;
        };
    };
    HarvestBehavior.prototype.Load = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        this.m_Source_id = String(data.behavior);
    };
    HarvestBehavior.prototype.Behavior = function (creep, room) {
        var source_id = this.m_Source_id;
        var source = Game.getObjectById(source_id);
        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES);
        }
        if (source) {
            var harvest_result = creep.harvest(source);
            this.m_Source_id = source.id;
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                var spawn = room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
                var extensions = room.GetOwnedStructures(STRUCTURE_EXTENSION);
                var deposit_places = __spreadArray([spawn], extensions);
                var deposit = creep.transfer(spawn, RESOURCE_ENERGY);
                if (deposit === ERR_NOT_IN_RANGE) {
                    creep.moveTo(deposit_places[0]);
                }
            }
            else if (harvest_result === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    };
    HarvestBehavior.prototype.Save = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        data.behavior = this.m_Source_id;
        HardDrive_1.HardDrive.Write(creep.name, data);
    };
    HarvestBehavior.prototype.ClearDiskData = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    return HarvestBehavior;
}());
exports.HarvestBehavior = HarvestBehavior;
