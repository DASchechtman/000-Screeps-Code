"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuresStack = void 0;
var GameObjectConsts_1 = require("../Constants/GameObjectConsts");
var StructuresStack = /** @class */ (function () {
    function StructuresStack() {
        this.stack = new Array();
    }
    StructuresStack.prototype.GetFirstElement = function () {
        var SortLowestToHighestIndex = function (struct_a, struct_b) {
            var sort_order = 0;
            if (struct_a.index < struct_b.index) {
                sort_order = -1;
            }
            else if (struct_a.index > struct_b.index) {
                sort_order = 1;
            }
            return sort_order;
        };
        this.stack.sort(SortLowestToHighestIndex);
        var structure = null;
        var start_index = -1;
        var stack_has_indexes = this.stack.length > 0;
        if (stack_has_indexes) {
            var index_has_elements = this.stack[0].array.length > 0;
            if (index_has_elements) {
                structure = this.stack[0].array[0];
                start_index = 0;
            }
        }
        return { struct: structure, index: start_index };
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
            var added = false;
            for (var i = 0; i < this.stack.length; i++) {
                var index = this.stack[i];
                if (struct.GetCurHealth() === index.index) {
                    this.PushToStack(struct, index);
                    added = true;
                    break;
                }
            }
            if (!added) {
                this.CreateIndex(struct, this.stack.length - 1);
            }
        }
    };
    StructuresStack.prototype.Peek = function () {
        return this.GetFirstElement().struct;
    };
    StructuresStack.prototype.Pop = function () {
        var first_el_obj = this.GetFirstElement();
        var struct = first_el_obj.struct;
        if (first_el_obj.index > -1) {
            this.stack[first_el_obj.index].array.shift();
        }
        return struct;
    };
    return StructuresStack;
}());
exports.StructuresStack = StructuresStack;
