"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepTypeQueue = void 0;
const CreepBehaviorConsts_1 = require("../Constants/CreepBehaviorConsts");
const Stack_1 = require("../DataStructures/Stack");
class CreepTypeQueue {
    constructor(room) {
        const num_of_sits = room.GetConstructionSites().length;
        const num_of_structs = room.GetAllNonHostileStructs((s) => { return s.hits < s.hitsMax; }).length;
        this.m_Max_types = new Map();
        this.m_Max_types.set(CreepBehaviorConsts_1.HARVEST_BEHAVIOR, 2);
        this.m_Max_types.set(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR, 2);
        this.m_Max_types.set(CreepBehaviorConsts_1.BUILDER_BEHAVIOR, (num_of_sits > 0) ? 1 : 0);
        this.m_Max_types.set(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR, room.GetHostileCreeps().length * 2);
        this.m_Max_types.set(CreepBehaviorConsts_1.REPAIR_BEHAVIOR, (num_of_structs > 0) ? 1 : 0);
    }
    CreateList(type, count, iterator) {
        const list = new Array();
        for (let i = count; i < iterator; i++) {
            list.push(type);
        }
        return list;
    }
    CreateStack(tracker) {
        const queue = new Stack_1.Stack();
        const cur_harvester = tracker.GetTypeCount(CreepBehaviorConsts_1.HARVEST_BEHAVIOR);
        const cur_upgrader = tracker.GetTypeCount(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR);
        const cur_builder = tracker.GetTypeCount(CreepBehaviorConsts_1.BUILDER_BEHAVIOR);
        const cur_defenders = tracker.GetTypeCount(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR);
        const cur_repair = tracker.GetTypeCount(CreepBehaviorConsts_1.REPAIR_BEHAVIOR);
        const max_harvest = this.m_Max_types.get(CreepBehaviorConsts_1.HARVEST_BEHAVIOR);
        const max_upgrader = this.m_Max_types.get(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR);
        const max_builder = this.m_Max_types.get(CreepBehaviorConsts_1.BUILDER_BEHAVIOR);
        const max_defender = this.m_Max_types.get(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR);
        const max_repair = this.m_Max_types.get(CreepBehaviorConsts_1.REPAIR_BEHAVIOR);
        const list = [
            ...this.CreateList(CreepBehaviorConsts_1.HARVEST_BEHAVIOR, cur_harvester, max_harvest),
            ...this.CreateList(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR, cur_upgrader, max_upgrader),
            ...this.CreateList(CreepBehaviorConsts_1.BUILDER_BEHAVIOR, cur_builder, max_builder),
            ...this.CreateList(CreepBehaviorConsts_1.REPAIR_BEHAVIOR, cur_repair, max_repair),
            ...this.CreateList(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR, cur_defenders, max_defender),
        ];
        for (let item of list) {
            queue.Push(item);
        }
        return queue;
    }
    GetMax(type) {
        let count = -1;
        if (this.m_Max_types.has(type)) {
            count = this.m_Max_types.get(type);
        }
        return count;
    }
}
exports.CreepTypeQueue = CreepTypeQueue;
