"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefendBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../../consts/CreepBehaviorConsts");
const CreepBehavior_1 = require("./CreepBehavior");
class DefendBehavior extends CreepBehavior_1.CreepBehavior {
    constructor(wrapper) {
        super(wrapper);
    }
    InitCreep(creep) { }
    InitTick(creep) { }
    FinishTick(creep) { }
    RunTick(creep, room) {
        const hostile_creeps = room.GetHostileCreeps();
        if (hostile_creeps.length > 0) {
            const x = hostile_creeps[0].pos.x;
            const y = hostile_creeps[0].pos.y;
            if (!creep.pos.inRangeTo(x, y, CreepBehaviorConsts_1.ActionDistance.ATTACK)) {
                creep.moveTo(hostile_creeps[0]);
            }
            else {
                creep.attack(hostile_creeps[0]);
            }
        }
        else if (hostile_creeps.length === 0) {
            creep.suicide();
        }
    }
    DestroyCreep(creep) { }
}
exports.DefendBehavior = DefendBehavior;
