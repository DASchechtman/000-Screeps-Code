"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepTypeTracker = void 0;
var CreepBehaviorConsts_1 = require("../Constants/CreepBehaviorConsts");
var CreepTypeTracker = /** @class */ (function () {
    function CreepTypeTracker() {
        this.m_Creep_catagories = new Map();
    }
    CreepTypeTracker.prototype.GetLevel = function (type) {
        var level;
        switch (type) {
            case CreepBehaviorConsts_1.DEFENDER_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_RESERVED;
                break;
            }
            case CreepBehaviorConsts_1.HARVEST_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_ONE;
                break;
            }
            case CreepBehaviorConsts_1.UPGRADER_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_TWO;
                break;
            }
            case CreepBehaviorConsts_1.BUILDER_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_THREE;
                break;
            }
        }
        return level;
    };
    CreepTypeTracker.prototype.Add = function (type, name) {
        var level = this.GetLevel(type);
        if (level) {
            if (!this.m_Creep_catagories.has(level)) {
                var collection = {
                    level: level,
                    count: 0,
                    collection: new Map()
                };
                this.m_Creep_catagories.set(level, collection);
            }
            var type_array = this.m_Creep_catagories.get(level).collection.get(type);
            var creep_type = {
                creep_type: type,
                creep_name: name
            };
            if (type_array) {
                type_array.push(creep_type);
            }
            else {
                var type_collection = this.m_Creep_catagories.get(level);
                type_collection.collection.set(type, new Array());
                type_collection.collection.get(type).push(creep_type);
            }
            this.m_Creep_catagories.get(level).count++;
        }
    };
    CreepTypeTracker.prototype.Remove = function (type, name) {
        var level = this.GetLevel(type);
        if (level && this.m_Creep_catagories.has(level)) {
            var creep_list = this.m_Creep_catagories.get(level).collection.get(type);
            if (creep_list) {
                var index = 0;
                for (var _i = 0, creep_list_1 = creep_list; _i < creep_list_1.length; _i++) {
                    var creep = creep_list_1[_i];
                    if (creep.creep_name === name) {
                        break;
                    }
                    index++;
                }
                creep_list.splice(index, 1);
                this.m_Creep_catagories.get(level).count--;
            }
        }
    };
    CreepTypeTracker.prototype.GetTypeCount = function (type) {
        var _a, _b;
        var number_of_creeps = 0;
        var level = this.GetLevel(type);
        if (level) {
            var list_len = (_b = (_a = this.m_Creep_catagories.get(level)) === null || _a === void 0 ? void 0 : _a.collection.get(type)) === null || _b === void 0 ? void 0 : _b.length;
            if (list_len) {
                number_of_creeps = list_len;
            }
        }
        return number_of_creeps;
    };
    CreepTypeTracker.prototype.GetLevelCount = function (level) {
        var _a;
        var number_of_creeps = 0;
        var count = (_a = this.m_Creep_catagories.get(level)) === null || _a === void 0 ? void 0 : _a.count;
        if (count) {
            number_of_creeps = count;
        }
        return number_of_creeps;
    };
    CreepTypeTracker.prototype.GetNamesByLevel = function (level) {
        var names = new Array();
        var level_collection = this.m_Creep_catagories.get(level);
        if (level_collection) {
            level_collection.collection.forEach(function (value, key) {
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var type = value_1[_i];
                    names.push(type.creep_name);
                }
            });
        }
        return names;
    };
    CreepTypeTracker.LEVEL_RESERVED = -1;
    CreepTypeTracker.LEVEL_ONE = 1;
    CreepTypeTracker.LEVEL_TWO = 2;
    CreepTypeTracker.LEVEL_THREE = 3;
    return CreepTypeTracker;
}());
exports.CreepTypeTracker = CreepTypeTracker;
