import { Behavior } from "../../../consts/CreepBehaviorConsts";
import { BuildScalableDefender, BuildScalableWorker, WORKER_BODY } from "../../../utils/creeps/CreepBuilder";
import { Spawner } from "../../../utils/creeps/Spawner";
import { RoomWrapper } from "../../room/RoomWrapper";
import { StructBehavior } from "./StructBehavior";

export class SpawnBehavior extends StructBehavior {
    
    InitTick(struct: StructureSpawn | StructureTower | StructureLink): void {
        
    }

    RunTick(struct: StructureSpawn | StructureTower | StructureLink, room: RoomWrapper): void {
        const tracker = new Spawner(room)
        tracker.TrackCreepTypes()
        const types = tracker.CreateSpawnList()

        const spawn = struct as StructureSpawn
        const num_of_harvesters = tracker.GetTrackedType(Behavior.HARVEST)
        const energy_cap = room.GetEnergyCapacity()
        const name = `${room.GetName()}-${Date.now()}-${types[0]}`
        let body: BodyPartConstant[]
        let spawn_type = types[0]

        if (spawn_type === Behavior.DEFENDER) {
            body = BuildScalableDefender(energy_cap)
        }
        else {
            body = BuildScalableWorker(energy_cap)
        }
        
        let ret: ScreepsReturnCode = ERR_FULL

        if (types.length > 0) {
            ret = spawn.spawnCreep(body, name)
        }

        if (ret === OK) {
            this.m_Data = [name, spawn_type]
        }
        else if (ret === ERR_NOT_ENOUGH_ENERGY && num_of_harvesters === 0) {
            ret = spawn.spawnCreep(WORKER_BODY, name)
            if (ret === OK) {
                this.m_Data = [name, spawn_type]
            }
        }
    }

    FinishTick(struct: StructureSpawn | StructureTower | StructureLink): void {

    }

}