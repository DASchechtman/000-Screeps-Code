"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefendBehavior = void 0;
var HardDrive_1 = require("../Disk/HardDrive");
var DefendBehavior = /** @class */ (function () {
    function DefendBehavior() {
    }
    DefendBehavior.prototype.ClearDiskData = function (creep) {
        throw new Error("Method not implemented.");
    };
    DefendBehavior.prototype.Load = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    DefendBehavior.prototype.Save = function (creep) {
        throw new Error("Method not implemented.");
    };
    DefendBehavior.prototype.Behavior = function (creep, room) {
        throw new Error("Method not implemented.");
    };
    return DefendBehavior;
}());
exports.DefendBehavior = DefendBehavior;
