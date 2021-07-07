"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuresStack = void 0;
var GameObjectConsts_1 = require("../Constants/GameObjectConsts");
var StructuresStack = /** @class */ (function () {
    function StructuresStack() {
        this.m_Stack = new Map();
        this.m_Lowest_key = -1;
    }
    StructuresStack.prototype.GetFirstElement = function () {
        var structure = null;
        var start_index = -1;
        if (this.m_Stack.has(this.m_Lowest_key)) {
            var index = this.m_Stack.get(this.m_Lowest_key);
            if (index.array.length > 0) {
                structure = index.array[0];
                start_index = this.m_Lowest_key;
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
    StructuresStack.prototype.CreateIndex = function (struct) {
        var new_index = {
            index: struct.GetCurHealth(),
            array: new Array()
        };
        this.m_Stack.set(new_index.index, new_index);
        this.PushToStack(struct, this.m_Stack.get(new_index.index));
    };
    StructuresStack.prototype.Add = function (struct) {
        var key = struct.GetCurHealth();
        if (this.m_Stack.size === 0) {
            this.m_Lowest_key = key;
            this.CreateIndex(struct);
        }
        else {
            if (this.m_Stack.has(key)) {
                this.PushToStack(struct, this.m_Stack.get(key));
            }
            else {
                if (key < this.m_Lowest_key) {
                    this.m_Lowest_key = key;
                }
                this.CreateIndex(struct);
            }
        }
    };
    StructuresStack.prototype.Peek = function () {
        return this.GetFirstElement().struct;
    };
    StructuresStack.prototype.Pop = function () {
        var _a;
        var first_el_obj = this.GetFirstElement();
        var struct = first_el_obj.struct;
        if (first_el_obj.index > -1) {
            (_a = this.m_Stack.get(first_el_obj.index)) === null || _a === void 0 ? void 0 : _a.array.shift();
        }
        return struct;
    };
    return StructuresStack;
}());
exports.StructuresStack = StructuresStack;
