"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuresStack = void 0;
var GameObjectConsts_1 = require("./GameObjectConsts");
var StructuresStack = /** @class */ (function () {
    function StructuresStack() {
        this.HIGH_PRIORITY = 0;
        this.MED_PRIORITY = 1;
        this.LOW_PRIORITY = 2;
        this.m_Timed_indexes = new Array();
        this.m_Indexes = new Array();
        this.m_Timed_stack = this.InitStack();
        this.m_Others_stack = this.InitStack();
    }
    StructuresStack.prototype.InitStack = function () {
        var stack = new Array();
        stack[this.HIGH_PRIORITY] = new Array();
        stack[this.MED_PRIORITY] = new Array();
        stack[this.LOW_PRIORITY] = new Array();
        return stack;
    };
    StructuresStack.prototype.GetPriorityLevel = function (struct) {
        var level;
        var five_percent = .05;
        var seventy_percent = .7;
        var max_health = struct.GetMaxHealth();
        var cur_health = struct.GetCurHealth();
        if (cur_health < max_health * five_percent) {
            level = this.HIGH_PRIORITY;
        }
        else if (cur_health < max_health * seventy_percent) {
            level = this.MED_PRIORITY;
        }
        else {
            level = this.LOW_PRIORITY;
        }
        return level;
    };
    StructuresStack.prototype.Add = function (struct) {
        var level = this.GetPriorityLevel(struct);
        var struct_index = struct.GetCurHealth();
        if (struct.SignalRecieverType() === GameObjectConsts_1.TIMED_STRUCTURE_TYPE) {
            if (this.m_Timed_stack[level].length === 0) {
                this.m_Timed_indexes[level] = struct_index;
            }
            this.m_Timed_stack[level][struct_index] = struct;
        }
        else {
            if (this.m_Others_stack[level].length === 0) {
                this.m_Indexes[level] = struct_index;
            }
            this.m_Others_stack[level][struct_index] = struct;
        }
    };
    StructuresStack.prototype.Pop = function () {
        var level_list = [
            this.HIGH_PRIORITY,
            this.MED_PRIORITY,
            this.LOW_PRIORITY
        ];
        var ret;
        for (var _i = 0, level_list_1 = level_list; _i < level_list_1.length; _i++) {
            var level = level_list_1[_i];
            var start_index = this.m_Timed_indexes[level];
            ret = this.m_Timed_stack[level][start_index];
            if (!ret) {
                start_index = this.m_Indexes[level];
                ret = this.m_Others_stack[level][start_index];
                break;
            }
            else {
                break;
            }
        }
        return ret;
    };
    return StructuresStack;
}());
exports.StructuresStack = StructuresStack;
