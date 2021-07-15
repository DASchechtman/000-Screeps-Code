"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepBehavior = void 0;
const HardDrive_1 = require("../../Disk/HardDrive");
const CreepBehaviorConsts_1 = require("../../Constants/CreepBehaviorConsts");
const PathFinder_1 = require("../../Navigation/PathFinder");
const CpuTimer_1 = require("../../CpuTimer");
class CreepBehavior {
    ClearDiskData(creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    }
    Signal(signal, creep) {
        return false;
    }
    MoveTo(distance, creep, location) {
        var _a, _b, _c, _d;
        let x = (_b = (_a = location) === null || _a === void 0 ? void 0 : _a.pos) === null || _b === void 0 ? void 0 : _b.x;
        let y = (_d = (_c = location) === null || _c === void 0 ? void 0 : _c.pos) === null || _d === void 0 ? void 0 : _d.y;
        if (!x) {
            x = location.x;
        }
        if (!y) {
            y = location.y;
        }
        const out_of_range = !creep.pos.inRangeTo(x, y, distance);
        if (out_of_range) {
            const p = new PathFinder_1.InRoomPathFinder();
            CpuTimer_1.CpuTimer.Start();
            p.MoveTo(creep, location, distance);
            CpuTimer_1.CpuTimer.End("time taken to move");
        }
        return out_of_range;
    }
    Harvest(creep, source) {
        if (!this.MoveTo(CreepBehaviorConsts_1.HARVEST_DISTANCE, creep, source)) {
            creep.harvest(source);
        }
    }
    UpdateWorkState(creep, cur_state) {
        const resource_type = RESOURCE_ENERGY;
        const used_cap = creep.store.getUsedCapacity(resource_type);
        const max_cap = creep.store.getCapacity(resource_type);
        let state = cur_state;
        if (used_cap === 0) {
            state = false;
        }
        else if (used_cap === max_cap) {
            state = true;
        }
        return state;
    }
    GetBehavior(creep) {
        return HardDrive_1.HardDrive.Read(creep.name).behavior;
    }
}
exports.CreepBehavior = CreepBehavior;
