"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DegradableStructureWrapper = void 0;
const GameConstants_1 = require("../../consts/GameConstants");
const StructureWrapper_1 = require("./StructureWrapper");
class DegradableStructureWrapper extends StructureWrapper_1.StructureWrapper {
    constructor(struct) {
        super(struct, GameConstants_1.GameEntityTypes.DEGRADABLE_STRUCT);
    }
}
exports.DegradableStructureWrapper = DegradableStructureWrapper;
