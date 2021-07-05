"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuresStack = void 0;
var GameObjectConsts_1 = require("../Constants/GameObjectConsts");
var StructuresStack = /** @class */ (function () {
    function StructuresStack() {
        this.stack = new Array();
    }
    StructuresStack.prototype.GetFirstElement = function () {
        var structure = null;
        var struct_index = 0;
        var group = this.stack[0];
        var element = group === null || group === void 0 ? void 0 : group.array[0];
        if (group && element) {
            structure = element;
        }
        else {
            struct_index = -1;
        }
        return [structure, struct_index];
    };
    StructuresStack.prototype.PushToStack = function (struct, index) {
        if (struct.SignalRecieverType() === GameObjectConsts_1.TIMED_STRUCTURE_TYPE) {
            index.array.unshift(struct);
        }
        else {
            index.array.push(struct);
        }
    };
    StructuresStack.prototype.CreateIndex = function (struct, index_in_stack) {
        var new_index = {
            index: struct.GetCurHealth(),
            array: new Array()
        };
        this.stack.splice(index_in_stack, 0, new_index);
        this.PushToStack(struct, this.stack[index_in_stack]);
    };
    StructuresStack.prototype.Add = function (struct) {
        if (this.stack.length === 0) {
            this.CreateIndex(struct, 0);
        }
        else {
            var stack_index = 0;
            while (stack_index < this.stack.length) {
                var el = this.stack[stack_index];
                if (struct.GetCurHealth() <= el.index) {
                    break;
                }
                stack_index++;
            }
            if (stack_index === this.stack.length) {
                this.CreateIndex(struct, stack_index - 1);
            }
            else if (this.stack[stack_index].index === struct.GetCurHealth()) {
                this.PushToStack(struct, this.stack[stack_index]);
            }
            else {
                this.CreateIndex(struct, stack_index);
            }
        }
    };
    StructuresStack.prototype.Peek = function () {
        return this.GetFirstElement()[0];
    };
    StructuresStack.prototype.Pop = function () {
        var list = this.GetFirstElement();
        var struct = list[0];
        if (list[1] > -1) {
            this.stack[list[1]].array.splice(0, 1);
        }
        return struct;
    };
    return StructuresStack;
}());
exports.StructuresStack = StructuresStack;
