"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepTypeQueue = void 0;
var CreepTypes_1 = require("../Creep/CreepTypes");
var Stack_1 = require("../DataStructures/Stack");
var CreepTypeQueue = /** @class */ (function () {
    function CreepTypeQueue(room) {
        var num_of_sits = room.GetConstructionSites().length;
        this.m_Max_types = new Map();
        this.m_Max_types.set(CreepTypes_1.HARVEST_TYPE, 2);
        this.m_Max_types.set(CreepTypes_1.UPGRADER_TYPE, 2);
        this.m_Max_types.set(CreepTypes_1.BUILDER_TYPE, (num_of_sits > 0) ? 1 : 0);
        this.m_Max_types.set(CreepTypes_1.DEFENDER_TYPE, room.GetHostileCreeps().length * 2);
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
        var cur_harvester = tracker.GetTypeCount(CreepTypes_1.HARVEST_TYPE);
        var cur_upgrader = tracker.GetTypeCount(CreepTypes_1.UPGRADER_TYPE);
        var cur_builder = tracker.GetTypeCount(CreepTypes_1.BUILDER_TYPE);
        var cur_defenders = tracker.GetTypeCount(CreepTypes_1.DEFENDER_TYPE);
        var list = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], this.CreateList(CreepTypes_1.HARVEST_TYPE, cur_harvester, this.m_Max_types.get(CreepTypes_1.HARVEST_TYPE))), this.CreateList(CreepTypes_1.UPGRADER_TYPE, cur_upgrader, this.m_Max_types.get(CreepTypes_1.UPGRADER_TYPE))), this.CreateList(CreepTypes_1.BUILDER_TYPE, cur_builder, this.m_Max_types.get(CreepTypes_1.BUILDER_TYPE))), this.CreateList(CreepTypes_1.DEFENDER_TYPE, cur_defenders, this.m_Max_types.get(CreepTypes_1.DEFENDER_TYPE)));
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
