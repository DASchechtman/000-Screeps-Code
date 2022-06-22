"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../../consts/CreepBehaviorConsts");
const HardDrive_1 = require("../../../utils/harddrive/HardDrive");
const InRoomPathFinder_1 = require("../../../utils/navigation/InRoomPathFinder");
const SourceWrapper_1 = require("../../SourceWrapper");
class CreepBehavior {
    constructor(wrapper) {
        this.m_Wrapper = wrapper;
    }
    ReceiveSignal(signal) {
        return false;
    }
    ClearDiskData(creep) {
        HardDrive_1.HardDrive.DeleteFolder(this.GetFolderPath(creep));
    }
    SourceNextTo(creep, sources) {
        let possible_source = null;
        for (let source of sources) {
            let next_to_source = creep.pos.inRangeTo(source, CreepBehaviorConsts_1.ActionDistance.HARVEST);
            if (next_to_source) {
                possible_source = source;
                break;
            }
        }
        return possible_source;
    }
    MoveTo(distance, location) {
        const p = new InRoomPathFinder_1.InRoomPathFinder();
        p.GeneratePath(this.m_Wrapper, location, distance);
        return p.MoveTo(this.m_Wrapper);
    }
    GetSource(creep, room) {
        let i = 0;
        const sources = room.GetSources();
        let correct_source = this.SourceNextTo(creep, sources);
        if (correct_source === undefined) {
            for (let source of sources) {
                const wrapper = new SourceWrapper_1.SourceWrapper(source.id);
                if (wrapper.HasFreeSpot()) {
                    correct_source = source;
                }
            }
        }
        return correct_source;
    }
    Harvest(source, room) {
        let moved = 0;
        const can_harvest = new SourceWrapper_1.SourceWrapper(source.id).HasFreeSpot();
        const creep = this.m_Wrapper.GetCreep();
        if (creep) {
            const is_close_to_source = creep.pos.inRangeTo(source, CreepBehaviorConsts_1.ActionDistance.HARVEST);
            const path_finder = new InRoomPathFinder_1.InRoomPathFinder();
            if (can_harvest && !is_close_to_source) {
                path_finder.GeneratePath(this.m_Wrapper, source, CreepBehaviorConsts_1.ActionDistance.HARVEST);
                if (!path_finder.MoveTo(this.m_Wrapper)) {
                    moved = 1;
                    creep.harvest(source);
                }
            }
            else if (is_close_to_source) {
                creep.harvest(source);
            }
        }
        return moved;
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
    GetFolderPath(creep) {
        return HardDrive_1.HardDrive.Join(this.m_Wrapper.GetPath(), "behavior-data");
    }
}
exports.CreepBehavior = CreepBehavior;
