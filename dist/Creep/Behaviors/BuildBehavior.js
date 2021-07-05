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
exports.BuildBehavior = void 0;
var HardDrive_1 = require("../../Disk/HardDrive");
var CreepBehavior_1 = require("./CreepBehavior");
var BuildBehavior = /** @class */ (function (_super) {
    __extends(BuildBehavior, _super);
    function BuildBehavior() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.m_Data = {};
        return _this;
    }
    BuildBehavior.prototype.Load = function (creep) {
        var behavior = this.GetBehavior(creep);
        var cur_state = Boolean(behavior === null || behavior === void 0 ? void 0 : behavior.can_build);
        this.m_Data = {
            can_build: this.UpdateWorkState(creep, cur_state)
        };
    };
    BuildBehavior.prototype.Run = function (creep, room) {
        var sites = room.GetConstructionSites();
        if (sites.length > 0) {
            var build_site = sites[0];
            var source = room.GetSources()[0];
            if (this.m_Data.can_build) {
                this.Build(creep, build_site);
            }
            else {
                this.Harvest(creep, source);
            }
        }
        else {
            this.ClearDiskData(creep);
            creep.suicide();
        }
    };
    BuildBehavior.prototype.Save = function (creep) {
        var data = HardDrive_1.HardDrive.Read(creep.name);
        data.behavior = this.m_Data;
        HardDrive_1.HardDrive.Write(creep.name, data);
    };
    BuildBehavior.prototype.Build = function (creep, build_site) {
        this.MoveTo(creep.build(build_site), creep, build_site);
    };
    return BuildBehavior;
}(CreepBehavior_1.CreepBehavior));
exports.BuildBehavior = BuildBehavior;
