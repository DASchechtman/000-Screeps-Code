"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spawner = void 0;
const CreepBehaviorConsts_1 = require("../../consts/CreepBehaviorConsts");
const PriorityQueue_1 = require("../datastructures/PriorityQueue");
const CreepWrapper_1 = require("../../core/creep/CreepWrapper");
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel[PriorityLevel["ULTRA_HIGH"] = 0] = "ULTRA_HIGH";
    PriorityLevel[PriorityLevel["HIGH"] = 1] = "HIGH";
    PriorityLevel[PriorityLevel["MED"] = 2] = "MED";
    PriorityLevel[PriorityLevel["LOW"] = 3] = "LOW";
    PriorityLevel[PriorityLevel["ULTRA_LOW"] = 4] = "ULTRA_LOW";
})(PriorityLevel || (PriorityLevel = {}));
class Spawner {
    constructor(room) {
        this.m_Type_tracker = new Map();
        this.m_Room = room;
    }
    HavesterRule() {
        const limit = 2;
        const creep_list = [];
        const harvesters_alive = this.m_Type_tracker.get(CreepBehaviorConsts_1.Behavior.HARVEST);
        harvesters_alive.max = limit;
        for (let i = harvesters_alive.current; i < limit; i++) {
            const creep = {
                behavior: CreepBehaviorConsts_1.Behavior.HARVEST,
                priority: PriorityLevel.ULTRA_LOW
            };
            switch (harvesters_alive.current) {
                case 0: {
                    creep.priority = PriorityLevel.HIGH;
                    break;
                }
                case 1: {
                    creep.priority = PriorityLevel.MED;
                    break;
                }
            }
            creep_list.push(creep);
        }
        return creep_list;
    }
    UpgraderRule() {
        const limit = 2;
        const creep_list = [];
        const upgraders_alive = this.m_Type_tracker.get(CreepBehaviorConsts_1.Behavior.UPGRADER);
        upgraders_alive.max = limit;
        for (let i = upgraders_alive.current; i < limit; i++) {
            creep_list.push({
                behavior: CreepBehaviorConsts_1.Behavior.UPGRADER,
                priority: PriorityLevel.MED
            });
        }
        return creep_list;
    }
    DefenderRule() {
        const num_of_hostile = this.m_Room.GetHostileCreeps().length;
        const creep_list = [];
        let priority_level;
        if (num_of_hostile === 1) {
            priority_level = PriorityLevel.ULTRA_LOW;
        }
        else if (num_of_hostile > 4) {
            priority_level = PriorityLevel.ULTRA_HIGH;
        }
        else {
            priority_level = PriorityLevel.ULTRA_LOW - num_of_hostile;
        }
        for (let i = 0; i < num_of_hostile; i++) {
            creep_list.push({
                behavior: CreepBehaviorConsts_1.Behavior.DEFENDER,
                priority: priority_level
            });
        }
        return creep_list;
    }
    BuilderRule() {
        const creep_list = [];
        const num_of_construction_sites = this.m_Room.GetConstructionSites().length;
        const builders_alive = this.m_Type_tracker.get(CreepBehaviorConsts_1.Behavior.BUILDER);
        builders_alive.max = 1;
        if (num_of_construction_sites > 0 && builders_alive.current === 0) {
            creep_list.push({
                behavior: CreepBehaviorConsts_1.Behavior.BUILDER,
                priority: PriorityLevel.LOW
            });
        }
        return creep_list;
    }
    RepairRule() {
        const creep_list = [];
        const filter = (struct) => { return struct.hits < struct.hitsMax; };
        const num_of_damaged_structs = this.m_Room.GetAllNonHostileStructs(filter).length;
        const repair_alive = this.m_Type_tracker.get(CreepBehaviorConsts_1.Behavior.REPAIR);
        repair_alive.max = 1;
        if (num_of_damaged_structs > 0 && repair_alive.current === 0) {
            creep_list.push({
                behavior: CreepBehaviorConsts_1.Behavior.REPAIR,
                priority: PriorityLevel.LOW
            });
        }
        return creep_list;
    }
    TrackCreepTypes() {
        for (let behavior in CreepBehaviorConsts_1.Behavior) {
            if (Number(behavior) !== CreepBehaviorConsts_1.Behavior.NONE && !this.m_Type_tracker.has(Number(behavior))) {
                this.m_Type_tracker.set(Number(behavior), { current: 0, max: null });
            }
        }
        const creep_list = this.m_Room.GetMyCreeps();
        for (const creep of creep_list) {
            const wrapper = new CreepWrapper_1.CreepWrapper(creep.name);
            wrapper.OnTickStart();
            const behavior = wrapper.GetBehavior();
            const cur_count = this.m_Type_tracker.get(behavior);
            if (cur_count) {
                this.m_Type_tracker.set(behavior, {
                    current: cur_count.current + 1,
                    max: cur_count.max
                });
            }
        }
    }
    GetTrackedType(behavior) {
        var _a;
        let type = (_a = this.m_Type_tracker.get(behavior)) === null || _a === void 0 ? void 0 : _a.current;
        if (type === undefined) {
            type = -1;
        }
        return type;
    }
    GetNeededType() {
        let type = CreepBehaviorConsts_1.Behavior.NONE;
        for (let [key, val] of this.m_Type_tracker) {
            if (val.max && val.current < val.max) {
                type = key;
            }
        }
        return type;
    }
    UntrackCreepTypes() {
        this.m_Type_tracker.clear();
    }
    CreateSpawnList() {
        const queue = new PriorityQueue_1.PriorityQueue((el) => { return el.priority; });
        let harvest_list = this.HavesterRule();
        queue.PushArray(harvest_list);
        queue.PushArray(this.UpgraderRule());
        queue.PushArray(this.DefenderRule());
        queue.PushArray(this.BuilderRule());
        queue.PushArray(this.RepairRule());
        let arr = queue.ToHeap().Map((val) => { return val.behavior; });
        return arr;
    }
}
exports.Spawner = Spawner;
