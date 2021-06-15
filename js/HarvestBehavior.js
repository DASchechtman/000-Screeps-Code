"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarvestBehavior = void 0;
var HardDrive_1 = require("./HardDrive");
var HarvestBehavior = /** @class */ (function () {
    function HarvestBehavior() {
        this.m_Source_id = "";
    }
    HarvestBehavior.prototype.Load = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        this.m_Source_id = String(data);
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
                var deposit = creep.transfer(spawn, RESOURCE_ENERGY);
                if (deposit === ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn);
                }
            }
            else if (harvest_result === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    };
    HarvestBehavior.prototype.Save = function (creep) {
        HardDrive_1.HardDrive.Write(creep.name, this.m_Source_id);
    };
    HarvestBehavior.prototype.ClearDiskData = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    return HarvestBehavior;
}());
exports.HarvestBehavior = HarvestBehavior;
