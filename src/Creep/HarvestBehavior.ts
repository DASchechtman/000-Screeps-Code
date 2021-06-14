import { HardDrive } from "../Disk/HardDrive";
import { RoomWrapper } from "../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class HarvestBehavior implements CreepBehavior {
    Load(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }

    Behavior(creep: Creep, room: RoomWrapper): void {
        const source = room.GetSources()[1]
        const harvest_result = creep.harvest(source)

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            const spawn = room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
            const deposit = creep.transfer(spawn, RESOURCE_ENERGY)

            if (deposit === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn)
            }
        }
        else if (harvest_result === ERR_NOT_IN_RANGE) {
            creep.moveTo(source)
        }

    }

    Save(creep: Creep): void {}

    ClearDiskData(creep: Creep): void {}

}