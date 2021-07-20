"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepTypeTracker = void 0;
const CreepBehaviorConsts_1 = require("../Constants/CreepBehaviorConsts");
class CreepTypeTracker {
    constructor() {
        this.m_Creep_catagories = new Map();
    }
    GetLevel(type) {
        let level;
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
            case CreepBehaviorConsts_1.BUILDER_BEHAVIOR:
            case CreepBehaviorConsts_1.REPAIR_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_THREE;
                break;
            }
        }
        return level;
    }
    Add(type, name) {
        const level = this.GetLevel(type);
        if (level) {
            if (!this.m_Creep_catagories.has(level)) {
                const collection = {
                    level: level,
                    count: 0,
                    collection: new Map()
                };
                this.m_Creep_catagories.set(level, collection);
            }
            const type_array = this.m_Creep_catagories.get(level).collection.get(type);
            const creep_type = {
                creep_type: type,
                creep_name: name
            };
            if (type_array) {
                type_array.push(creep_type);
            }
            else {
                const type_collection = this.m_Creep_catagories.get(level);
                type_collection.collection.set(type, new Array());
                type_collection.collection.get(type).push(creep_type);
            }
            this.m_Creep_catagories.get(level).count++;
        }
    }
    Remove(type, name) {
        const level = this.GetLevel(type);
        if (level && this.m_Creep_catagories.has(level)) {
            const creep_list = this.m_Creep_catagories.get(level).collection.get(type);
            if (creep_list) {
                let index = 0;
                for (let creep of creep_list) {
                    if (creep.creep_name === name) {
                        break;
                    }
                    index++;
                }
                creep_list.splice(index, 1);
                this.m_Creep_catagories.get(level).count--;
            }
        }
    }
    GetTypeCount(type) {
        var _a, _b;
        let number_of_creeps = 0;
        const level = this.GetLevel(type);
        if (level) {
            const list_len = (_b = (_a = this.m_Creep_catagories.get(level)) === null || _a === void 0 ? void 0 : _a.collection.get(type)) === null || _b === void 0 ? void 0 : _b.length;
            if (list_len) {
                number_of_creeps = list_len;
            }
        }
        return number_of_creeps;
    }
    GetLevelCount(level) {
        var _a;
        let number_of_creeps = 0;
        const count = (_a = this.m_Creep_catagories.get(level)) === null || _a === void 0 ? void 0 : _a.count;
        if (count) {
            number_of_creeps = count;
        }
        return number_of_creeps;
    }
    GetNamesByLevel(level) {
        const names = new Array();
        const level_collection = this.m_Creep_catagories.get(level);
        if (level_collection) {
            level_collection.collection.forEach((value, key) => {
                for (let type of value) {
                    names.push(type.creep_name);
                }
            });
        }
        return names;
    }
}
exports.CreepTypeTracker = CreepTypeTracker;
CreepTypeTracker.LEVEL_RESERVED = -1;
CreepTypeTracker.LEVEL_ONE = 1;
CreepTypeTracker.LEVEL_TWO = 2;
CreepTypeTracker.LEVEL_THREE = 3;
