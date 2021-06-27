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
        this.m_Transfered_all_energy = false;
    }
    HarvestBehavior.prototype.SignalTask = function () {
        return null;
    };
    HarvestBehavior.prototype.Load = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        this.m_Source_id = String(data.behavior.id);
        this.m_Transfered_all_energy = Boolean(data.behavior.empty);
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
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                this.m_Transfered_all_energy = true;
            }
            else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                this.m_Transfered_all_energy = false;
            }
            if (this.m_Transfered_all_energy) {
                var spawn = room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
                var extensions = room.GetOwnedStructures(STRUCTURE_EXTENSION);
                var deposit_places = __spreadArray([spawn], extensions);
                var container = deposit_places[0];
                for (var _i = 0, deposit_places_1 = deposit_places; _i < deposit_places_1.length; _i++) {
                    var storage = deposit_places_1[_i];
                    if (storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        container = storage;
                        break;
                    }
                }
                var deposit = creep.transfer(container, RESOURCE_ENERGY);
                if (deposit === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
            }
            else {
                creep.moveTo(source);
            }
        }
    };
    HarvestBehavior.prototype.Save = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        var behavior_data = {
            id: this.m_Source_id,
            empty: this.m_Transfered_all_energy
        };
        data.behavior = behavior_data;
        HardDrive_1.HardDrive.Write(creep.name, data);
    };
    HarvestBehavior.prototype.ClearDiskData = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    return HarvestBehavior;
}());
exports.HarvestBehavior = HarvestBehavior;
