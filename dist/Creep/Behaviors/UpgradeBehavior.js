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
exports.UpgradeBehavior = void 0;
var HardDrive_1 = require("../../Disk/HardDrive");
var CreepBehavior_1 = require("./CreepBehavior");
var CreepBehaviorConsts_1 = require("../../Constants/CreepBehaviorConsts");
var UpgradeBehavior = /** @class */ (function (_super) {
    __extends(UpgradeBehavior, _super);
    function UpgradeBehavior() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.m_Data = {};
        return _this;
    }
    UpgradeBehavior.prototype.Load = function (creep) {
        var behavior = this.GetBehavior(creep);
        var cur_state = Boolean(behavior === null || behavior === void 0 ? void 0 : behavior.can_upgrade);
        this.m_Data = {
            can_upgrade: this.UpdateWorkState(creep, cur_state)
        };
    };
    UpgradeBehavior.prototype.Run = function (creep, room) {
        var controller = room.GetOwnedStructures(STRUCTURE_CONTROLLER)[0];
        var source = room.GetSources()[0];
        if (this.m_Data.can_upgrade === true) {
            this.Upgrade(creep, controller);
        }
        else if (this.m_Data.can_upgrade === false) {
            this.Harvest(creep, source);
        }
    };
    UpgradeBehavior.prototype.Save = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        data.behavior = this.m_Data;
        HardDrive_1.HardDrive.Write(creep.name, data);
    };
    UpgradeBehavior.prototype.Upgrade = function (creep, controller) {
        var _a;
        var dist = CreepBehaviorConsts_1.UPGRADE_DISTANCE;
        var change_sign = false;
        var shield = "\uD83D\uDEE1\uFE0F";
        var cross_swords = "\u2694\uFE0F";
        var msg = shield + " This room is under the protection of the DAS colony. " + cross_swords;
        if (((_a = controller.sign) === null || _a === void 0 ? void 0 : _a.text) !== msg) {
            dist = CreepBehaviorConsts_1.CHANGE_SIGN_DISTANCE;
            change_sign = true;
        }
        if (!this.MoveTo(dist, creep, controller)) {
            if (change_sign) {
                creep.signController(controller, msg);
            }
            else {
                creep.upgradeController(controller);
            }
        }
    };
    return UpgradeBehavior;
}(CreepBehavior_1.CreepBehavior));
exports.UpgradeBehavior = UpgradeBehavior;
