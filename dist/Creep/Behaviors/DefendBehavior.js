"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefendBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../Constants/CreepBehaviorConsts");
const HardDrive_1 = require("../../Disk/HardDrive");
const CreepBehavior_1 = require("./CreepBehavior");
class DefendBehavior extends CreepBehavior_1.CreepBehavior {
    Load(creep) {
        HardDrive_1.HardDrive.Erase(creep.name);
    }
    Save(creep) { }
    Run(creep, room) {
        const hostile_creeps = room.GetHostileCreeps();
        if (hostile_creeps.length > 0 && !this.MoveTo(CreepBehaviorConsts_1.ATTACK_DISTANCE, creep, hostile_creeps[0])) {
            creep.moveTo(hostile_creeps[0]);
        }
        else if (hostile_creeps.length === 0) {
            creep.suicide();
        }
    }
}
exports.DefendBehavior = DefendBehavior;
