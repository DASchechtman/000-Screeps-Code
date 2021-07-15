"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimedStructureWrapper = void 0;
const GameObjectConsts_1 = require("../Constants/GameObjectConsts");
const StructureWrapper_1 = require("./StructureWrapper");
class TimedStructureWrapper extends StructureWrapper_1.StructureWrapper {
    constructor(struct_id) {
        super(struct_id, GameObjectConsts_1.TIMED_STRUCTURE_TYPE);
        const x = this.m_Cur_health;
    }
}
exports.TimedStructureWrapper = TimedStructureWrapper;
