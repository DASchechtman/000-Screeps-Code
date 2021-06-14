"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarvestBehavior = void 0;
var HarvestBehavior = /** @class */ (function () {
    function HarvestBehavior() {
    }
    HarvestBehavior.prototype.Load = function (creep) { };
    HarvestBehavior.prototype.Behavior = function (creep, room) {
        var source = room.GetSources()[1];
        var harvest_result = creep.harvest(source);
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
    };
    HarvestBehavior.prototype.Save = function (creep) { };
    HarvestBehavior.prototype.Destroy = function (creep) { };
    return HarvestBehavior;
}());
exports.HarvestBehavior = HarvestBehavior;
