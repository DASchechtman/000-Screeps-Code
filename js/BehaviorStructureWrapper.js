"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorStructureWrapper = void 0;
const GameObjectConsts_1 = require("./GameObjectConsts");
const StructureWrapper_1 = require("./StructureWrapper");
class BehaviorStructureWrapper extends StructureWrapper_1.StructureWrapper {
    constructor(struct_id) {
        var _a;
        super(struct_id, GameObjectConsts_1.BEHAVIOR_STRUCTURE_TYPE);
        const r = (_a = this.m_Struct) === null || _a === void 0 ? void 0 : _a.room.name;
    }
}
exports.BehaviorStructureWrapper = BehaviorStructureWrapper;
