import { HardDrive } from "../../Disk/HardDrive";
import { GameObject } from "../../GameObject";
import { JsonObj, Signal } from "../../CompilerTyping/Interfaces";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { RoomPos } from "../../CompilerTyping/Types";
import { HARVEST_DISTANCE } from "../../Constants/CreepBehaviorConsts";


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

    protected MoveTo(distance: number, creep: Creep, location: RoomPos) {

        let pos_x: number
        let pos_y: number

        if (location instanceof RoomPosition) {

            pos_x = location.x
            pos_y = location.y
        }
        else {
            pos_x = location.pos.x
            pos_y = location.pos.y            
        }

        const abs_x = Math.abs(creep.pos.x - pos_x)
        const abs_y = Math.abs(creep.pos.y - pos_y)

        const move_x = abs_x > distance 
        const move_y = abs_y > distance
        const move = move_x || move_y

        if (move) {
            creep.moveTo(pos_x, pos_y)
        }

        return move
    }

    protected Harvest(creep: Creep, source: Source): void {
        if (!this.MoveTo(HARVEST_DISTANCE, creep, source)) {
            creep.harvest(source)
        }
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