"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuresStack = void 0;
const GameObjectConsts_1 = require("../Constants/GameObjectConsts");
class StructuresStack {
    constructor() {
        this.m_Stack = new Map();
        this.m_Lowest_key = -1;
    }
    GetFirstElement() {
        let structure = null;
        let start_index = -1;
        if (this.m_Stack.has(this.m_Lowest_key)) {
            const index = this.m_Stack.get(this.m_Lowest_key);
            if (index.array.length > 0) {
                structure = index.array[0];
                start_index = this.m_Lowest_key;
            }
        }
        return { struct: structure, index: start_index };
    }
    PushToStack(struct, index) {
        var _a;
        const is_timed = struct.SignalRecieverType() === GameObjectConsts_1.TIMED_STRUCTURE_TYPE;
        const is_rampart = ((_a = struct.GetStructure()) === null || _a === void 0 ? void 0 : _a.structureType) === STRUCTURE_RAMPART;
        if (is_timed && is_rampart) {
            index.array.unshift(struct);
            index.timed_defense_index++;
        }
        else if (is_timed) {
            const insert_index = index.timed_defense_index;
            index.array.splice(insert_index, 0, struct);
        }
        else {
            index.array.push(struct);
        }
    }
    CreateIndex(struct) {
        const new_index = {
            index: struct.GetCurHealth(),
            timed_defense_index: 0,
            array: new Array()
        };
        this.m_Stack.set(new_index.index, new_index);
        this.PushToStack(struct, this.m_Stack.get(new_index.index));
    }
    Add(struct) {
        const key = struct.GetCurHealth();
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
    }
    Peek() {
        return this.GetFirstElement().struct;
    }
    Pop() {
        var _a;
        const first_el_obj = this.GetFirstElement();
        const struct = first_el_obj.struct;
        if (first_el_obj.index > -1) {
            (_a = this.m_Stack.get(first_el_obj.index)) === null || _a === void 0 ? void 0 : _a.array.shift();
        }
        return struct;
    }
}
exports.StructuresStack = StructuresStack;
