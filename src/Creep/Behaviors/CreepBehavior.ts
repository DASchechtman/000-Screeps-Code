import { HardDrive } from "../../Disk/HardDrive";
import { GameObject } from "../../GameObject";
import { Signal } from "../../CompilerTyping/Interfaces";
import { RoomWrapper } from "../../Room/RoomWrapper";


export abstract class CreepBehavior {
    abstract Load(creep: Creep): void
    abstract Run(creep: Creep, room: RoomWrapper): void
    abstract Save(creep: Creep): void
    
    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }

    Signal(signal: Signal, creep: GameObject): boolean  {
        return false
    }

    protected MoveTo(
        result: ScreepsReturnCode,
        creep: Creep,
        location: RoomPosition | {pos: RoomPosition}
        ): void 
    {
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(location)
        }
    }

    protected Harvest(creep: Creep, source: Source): void {
        this.MoveTo(creep.harvest(source), creep, source)
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
}