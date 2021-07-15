"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityStructuresStack = void 0;
const GameObjectConsts_1 = require("./GameObjectConsts");
const StructuresStack_1 = require("./StructuresStack");
class PriorityStructuresStack {
    constructor() {
        this.m_Regulare_structs = new StructuresStack_1.StructuresStack();
        this.m_Timed_structs = new StructuresStack_1.StructuresStack();
        this.m_Timed_defense_structs = new StructuresStack_1.StructuresStack();
    }
    GetStructStack(struct) {
        var _a;
        let ret = this.m_Regulare_structs;
        const is_timed = struct.SignalRecieverType() === GameObjectConsts_1.TIMED_STRUCTURE_TYPE;
        const low_health = struct.GetCurHealth() < struct.GetMaxHealth() * .03;
        const is_rampart = ((_a = struct.GetStructure()) === null || _a === void 0 ? void 0 : _a.structureType) === STRUCTURE_RAMPART;
        if (is_timed && low_health) {
            if (is_rampart) {
                ret = this.m_Timed_defense_structs;
            }
            else {
                ret = this.m_Timed_structs;
            }
        }
        return ret;
    }
    GetArrayOfStacks() {
        return [
            this.m_Timed_defense_structs,
            this.m_Timed_structs,
            this.m_Regulare_structs
        ];
    }
    GetTopElementInStack() {
        let ret = null;
        let stack_list = this.GetArrayOfStacks();
        let i = 0;
        while (!ret && i < stack_list.length) {
            ret = stack_list[i].Peek();
            i++;
        }
        return { struct: ret, stack: stack_list[i - 1] };
    }
    Add(struct) {
        const stack = this.GetStructStack(struct);
        stack.Add(struct);
    }
    Peek() {
        return this.GetTopElementInStack().struct;
    }
    Pop() {
        let obj = this.GetTopElementInStack();
        obj.stack.Pop();
        return obj.struct;
    }
}
exports.PriorityStructuresStack = PriorityStructuresStack;
