"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepBehavior = void 0;
const HardDrive_1 = require("./HardDrive");
const CreepBehaviorConsts_1 = require("./CreepBehaviorConsts");
const PathFinder_1 = require("./PathFinder");
class CreepBehavior {
    ClearDiskData(creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    }
    Signal(signal, creep) {
        return false;
    }
    MoveTo(distance, creep, location) {
        const p = new PathFinder_1.InRoomPathFinder();
        const moved = p.MoveTo(creep, location, distance);
        return moved;
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
