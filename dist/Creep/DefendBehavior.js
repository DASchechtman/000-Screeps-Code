"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefendBehavior = void 0;
var HardDrive_1 = require("../Disk/HardDrive");
var DefendBehavior = /** @class */ (function () {
    function DefendBehavior() {
    }
    DefendBehavior.prototype.ClearDiskData = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    DefendBehavior.prototype.Load = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    DefendBehavior.prototype.Save = function (creep) {
    };
    DefendBehavior.prototype.Behavior = function (creep, room) {
        var hostile_creeps = room.GetHostileCreeps();
        var res = creep.attack(hostile_creeps[0]);
        if (res === ERR_NOT_IN_RANGE) {
            creep.moveTo(hostile_creeps[0]);
        }
    };
    return DefendBehavior;
}());
exports.DefendBehavior = DefendBehavior;
