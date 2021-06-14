"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeBehavior = void 0;
var HardDrive_1 = require("./HardDrive");
var UpgradeBehavior = /** @class */ (function () {
    function UpgradeBehavior() {
        this.m_Should_upgrade = null;
    }
    UpgradeBehavior.prototype.Load = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        this.m_Should_upgrade = Boolean(data);
    };
    UpgradeBehavior.prototype.Behavior = function (creep, room) {
        var controller = room.GetOwnedStructures(STRUCTURE_CONTROLLER)[0];
        var source = room.GetSources()[0];
        var cur_capacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);
        var max_capacity = creep.store.getCapacity(RESOURCE_ENERGY);
        if (cur_capacity === 0) {
            this.m_Should_upgrade = false;
        }
        else if (max_capacity === cur_capacity) {
            this.m_Should_upgrade = true;
        }
        if (this.m_Should_upgrade === true) {
            var res = creep.upgradeController(controller);
            if (res === ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
        }
        else if (this.m_Should_upgrade === false) {
            var res = creep.harvest(source);
            if (res === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    };
    UpgradeBehavior.prototype.Save = function (creep) {
        HardDrive_1.HardDrive.Write(creep.name, this.m_Should_upgrade);
    };
    UpgradeBehavior.prototype.ClearDiskData = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    return UpgradeBehavior;
}());
exports.UpgradeBehavior = UpgradeBehavior;
