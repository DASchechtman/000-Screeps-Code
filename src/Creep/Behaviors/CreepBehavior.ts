import { HardDrive } from "../../Disk/HardDrive";
import { GameObject } from "../../GameObject";
import { JsonObj, Signal } from "../../CompilerTyping/Interfaces";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { RoomPos } from "../../CompilerTyping/Types";
import { HARVEST_DISTANCE } from "../../Constants/CreepBehaviorConsts";
import { InRoomPathFinder } from "../../Navigation/PathFinder";
import { cpuUsage } from "process";
import { CpuTimer } from "../../CpuTimer";


export abstract class CreepBehavior {
    abstract Load(creep: Creep): void
    abstract Run(creep: Creep, room: RoomWrapper): void
    abstract Save(creep: Creep): void

    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }

    Signal(signal: Signal, creep: GameObject): boolean {
        return false
    }

    protected MoveTo(distance: number, creep: Creep, location: RoomPos) {
        const p = new InRoomPathFinder()
        const moved = p.MoveTo(creep, location, distance)
        return moved
    }

    protected Harvest(creep: Creep, source: Source): number {
        let moved = 0
        if (!this.MoveTo(HARVEST_DISTANCE, creep, source)) {
            creep.harvest(source)
            moved = 1
        }
        return moved
    }

    protected UpdateWorkState(creep: Creep, cur_state: boolean): boolean {
        const resource_type = RESOURCE_ENERGY
        const used_cap = creep.store.getUsedCapacity(resource_type)
        const max_cap = creep.store.getCapacity(resource_type)

        let state = cur_state

        if (used_cap === 0) {
            state = false
        }
        else if (used_cap === max_cap) {
            state = true
        }

        return state
    }

    protected GetBehavior(creep: Creep): JsonObj {
        return HardDrive.Read(creep.name).behavior as JsonObj
    }
}