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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarvestBehavior = void 0;
var HardDrive_1 = require("./HardDrive");
var CreepBehavior_1 = require("./CreepBehavior");
var HarvestBehavior = /** @class */ (function (_super) {
    __extends(HarvestBehavior, _super);
    function HarvestBehavior() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.m_Data = {};
        return _this;
    }
    HarvestBehavior.prototype.Load = function (creep) {
        var _a, _b;
        var data = HardDrive_1.HardDrive.Read(creep.name);
        var cur_state = Boolean((_a = data.behavior) === null || _a === void 0 ? void 0 : _a.full);
        this.m_Data = {
            id: String((_b = data.behavior) === null || _b === void 0 ? void 0 : _b.id),
            full: this.UpdateWorkState(creep, cur_state)
        };
    };
    HarvestBehavior.prototype.Run = function (creep, room) {
        var source = this.GetEnergySource(creep);
        if (source) {
            this.m_Data.id = source.id;
            if (this.m_Data.full) {
                var container = this.GetFreeContainer(room);
                this.DepositToContainer(creep, container);
            }
            else {
                this.Harvest(creep, source);
            }
        }
    };
    HarvestBehavior.prototype.Save = function (creep) {
        var save_data = HardDrive_1.HardDrive.Read(creep.name);
        save_data.behavior = this.m_Data;
        HardDrive_1.HardDrive.Write(creep.name, save_data);
    };
    HarvestBehavior.prototype.UpdateWorkState = function (creep, cur_state) {
        var resource_type = RESOURCE_ENERGY;
        var used_cap = creep.store.getUsedCapacity(resource_type);
        var free_cap = creep.store.getFreeCapacity(resource_type);
        var state = cur_state;
        if (used_cap === 0) {
            state = false;
        }
        else if (free_cap === 0) {
            state = true;
        }
        return state;
    };
    HarvestBehavior.prototype.GetFreeContainer = function (room) {
        var spawn = room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
        var extensions = room.GetOwnedStructures(STRUCTURE_EXTENSION);
        var free_containers = __spreadArray([spawn], extensions);
        var container = spawn;
        for (var _i = 0, free_containers_1 = free_containers; _i < free_containers_1.length; _i++) {
            var storage = free_containers_1[_i];
            if (storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                container = storage;
                break;
            }
        }
        return container;
    };
    HarvestBehavior.prototype.DepositToContainer = function (creep, container) {
        var res = creep.transfer(container, RESOURCE_ENERGY);
        this.MoveTo(res, creep, container);
    };
    HarvestBehavior.prototype.GetEnergySource = function (creep) {
        var source_id = this.m_Data.id;
        var source = Game.getObjectById(source_id);
        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES);
        }
        return source;
    };
    return HarvestBehavior;
}(CreepBehavior_1.CreepBehavior));
exports.HarvestBehavior = HarvestBehavior;
