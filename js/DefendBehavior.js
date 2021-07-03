"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefendBehavior = void 0;
var HardDrive_1 = require("./HardDrive");
var CreepBehavior_1 = require("./CreepBehavior");
var DefendBehavior = /** @class */ (function (_super) {
    __extends(DefendBehavior, _super);
    function DefendBehavior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefendBehavior.prototype.Load = function (creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    };
    DefendBehavior.prototype.Save = function (creep) { };
    DefendBehavior.prototype.Run = function (creep, room) {
        var hostile_creeps = room.GetHostileCreeps();
        var res = creep.attack(hostile_creeps[0]);
        if (res === ERR_NOT_IN_RANGE) {
            creep.moveTo(hostile_creeps[0]);
        }
        else {
            creep.suicide();
        }
    };
    return DefendBehavior;
}(CreepBehavior_1.CreepBehavior));
exports.DefendBehavior = DefendBehavior;
