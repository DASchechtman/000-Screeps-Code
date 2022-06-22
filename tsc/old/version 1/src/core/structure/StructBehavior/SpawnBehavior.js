"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpawnBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../../consts/CreepBehaviorConsts");
const CreepBuilder_1 = require("../../../utils/creeps/CreepBuilder");
const Spawner_1 = require("../../../utils/creeps/Spawner");
const StructBehavior_1 = require("./StructBehavior");
class SpawnBehavior extends StructBehavior_1.StructBehavior {
    InitTick(struct) {
    }
    RunTick(struct, room) {
        const tracker = new Spawner_1.Spawner(room);
        tracker.TrackCreepTypes();
        debugger;
        const types = tracker.CreateSpawnList();
        const spawn = struct;
        const num_of_harvesters = tracker.GetTrackedType(CreepBehaviorConsts_1.Behavior.HARVEST);
        const energy_cap = room.GetEnergyCapacity();
        const name = `${room.GetName()} - ${Date.now()}`;
        let body;
        let spawn_type = types[0];
        if (spawn_type === CreepBehaviorConsts_1.Behavior.DEFENDER) {
            body = CreepBuilder_1.BuildScalableDefender(energy_cap);
        }
        else {
            body = CreepBuilder_1.BuildScalableWorker(energy_cap);
        }
        let ret = spawn.spawnCreep(body, name);
        console.log(num_of_harvesters);
        if (ret === OK) {
            console.log(`saving behavior to ${CreepBehaviorConsts_1.Behavior[spawn_type]}`);
            this.m_Data = [name, spawn_type];
        }
        else if (ret === ERR_NOT_ENOUGH_ENERGY && num_of_harvesters === 0) {
            ret = spawn.spawnCreep(CreepBuilder_1.WORKER_BODY, name);
            if (ret === OK) {
                this.m_Data = [name, spawn_type];
            }
        }
    }
    FinishTick(struct) {
    }
}
exports.SpawnBehavior = SpawnBehavior;
