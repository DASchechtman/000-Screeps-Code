"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildBehavior = void 0;
var HardDrive_1 = require("./HardDrive");
var BuildBehavior = /** @class */ (function () {
    function BuildBehavior() {
    }
    BuildBehavior.prototype.ClearDiskData = function (creep) {
        throw new Error("Method not implemented.");
    };
    BuildBehavior.prototype.Load = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    BuildBehavior.prototype.Save = function (creep) {
        throw new Error("Method not implemented.");
    };
    BuildBehavior.prototype.Behavior = function (creep, room) {
        throw new Error("Method not implemented.");
    };
    return BuildBehavior;
}());
exports.BuildBehavior = BuildBehavior;
