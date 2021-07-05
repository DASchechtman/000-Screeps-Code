"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepTypeQueue = void 0;
var CreepBehaviorConsts_1 = require("../Constants/CreepBehaviorConsts");
var Stack_1 = require("../DataStructures/Stack");
var CreepTypeQueue = /** @class */ (function () {
    function CreepTypeQueue(room) {
        var num_of_sits = room.GetConstructionSites().length;
        var num_of_structs = room.GetAllNonHostileStructs(function (s) { return s.hits < s.hitsMax; }).length;
        this.m_Max_types = new Map();
        this.m_Max_types.set(CreepBehaviorConsts_1.HARVEST_BEHAVIOR, 2);
        this.m_Max_types.set(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR, 2);
        this.m_Max_types.set(CreepBehaviorConsts_1.BUILDER_BEHAVIOR, (num_of_sits > 0) ? 1 : 0);
        this.m_Max_types.set(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR, room.GetHostileCreeps().length * 2);
        this.m_Max_types.set(CreepBehaviorConsts_1.REPAIR_BEHAVIOR, (num_of_structs > 0) ? 1 : 0);
    }
    CreepTypeQueue.prototype.CreateList = function (type, count, iterator) {
        var list = new Array();
        for (var i = count; i < iterator; i++) {
            list.push(type);
        }
        return list;
    };
    CreepTypeQueue.prototype.CreateStack = function (tracker) {
        var queue = new Stack_1.Stack();
        var cur_harvester = tracker.GetTypeCount(CreepBehaviorConsts_1.HARVEST_BEHAVIOR);
        var cur_upgrader = tracker.GetTypeCount(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR);
        var cur_builder = tracker.GetTypeCount(CreepBehaviorConsts_1.BUILDER_BEHAVIOR);
        var cur_defenders = tracker.GetTypeCount(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR);
        var cur_repair = tracker.GetTypeCount(CreepBehaviorConsts_1.REPAIR_BEHAVIOR);
        var max_harvest = this.m_Max_types.get(CreepBehaviorConsts_1.HARVEST_BEHAVIOR);
        var max_upgrader = this.m_Max_types.get(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR);
        var max_builder = this.m_Max_types.get(CreepBehaviorConsts_1.BUILDER_BEHAVIOR);
        var max_defender = this.m_Max_types.get(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR);
        var max_repair = this.m_Max_types.get(CreepBehaviorConsts_1.REPAIR_BEHAVIOR);
        var list = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], this.CreateList(CreepBehaviorConsts_1.HARVEST_BEHAVIOR, cur_harvester, max_harvest)), this.CreateList(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR, cur_upgrader, max_upgrader)), this.CreateList(CreepBehaviorConsts_1.BUILDER_BEHAVIOR, cur_builder, max_builder)), this.CreateList(CreepBehaviorConsts_1.REPAIR_BEHAVIOR, cur_repair, max_repair)), this.CreateList(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR, cur_defenders, max_defender));
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var item = list_1[_i];
            queue.Push(item);
        }
        return queue;
    };
    CreepTypeQueue.prototype.GetMax = function (type) {
        var count = -1;
        if (this.m_Max_types.has(type)) {
            count = this.m_Max_types.get(type);
        }
        return count;
    };
    return CreepTypeQueue;
}());
exports.CreepTypeQueue = CreepTypeQueue;
