"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildBehavior = void 0;
var HardDrive_1 = require("./HardDrive");
var BuildBehavior = /** @class */ (function () {
    function BuildBehavior() {
        this.m_Can_build = false;
    }
    BuildBehavior.prototype.SignalTask = function () {
        return null;
    };
    BuildBehavior.prototype.Load = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        this.m_Can_build = Boolean(data.behavior);
    };
    BuildBehavior.prototype.Behavior = function (creep, room) {
        var sites = room.GetConstructionSites();
        if (sites.length > 0) {
            var build_site = sites[0];
            var source = room.GetSources()[0];
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                this.m_Can_build = false;
            }
            else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY)) {
                this.m_Can_build = true;
            }
            if (this.m_Can_build) {
                var res = creep.build(build_site);
                if (res === ERR_NOT_IN_RANGE) {
                    creep.moveTo(build_site);
                }
            }
            else {
                var res = creep.harvest(source);
                if (res === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
        else {
            this.ClearDiskData(creep);
            creep.suicide();
        }
    };
    BuildBehavior.prototype.Save = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        data.behavior = this.m_Can_build;
        HardDrive_1.HardDrive.Write(creep.name, data);
    };
    BuildBehavior.prototype.ClearDiskData = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    return BuildBehavior;
}());
exports.BuildBehavior = BuildBehavior;
