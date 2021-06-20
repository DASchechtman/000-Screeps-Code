import { Colony } from "../Colony/Colony";
import { HardDrive, JsonObj } from "../Disk/HardDrive";
import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { Signal } from "../Signals/SignalManager";
import { CreepBehavior } from "./CreepBehavior";
import { CreepWrapper } from "./CreepWrapper";

export class HarvestBehavior implements CreepBehavior {
    SignalTask(): ((signal: Signal, obj: GameObject) => boolean) | null {
        return (signal, obj): boolean => {
            const creep = signal.from as CreepWrapper
            (obj as Colony).ResetBehaviors()
            return true
        }
    }

    private m_Source_id = ""

    Load(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        this.m_Source_id = String(data.behavior)
    }

    Behavior(creep: Creep, room: RoomWrapper): void {
        const source_id = this.m_Source_id as Id<Source>

        let source = Game.getObjectById(source_id)

        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES)
        }


        if (source) {
            const harvest_result = creep.harvest(source)
            this.m_Source_id = source.id

            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                const spawn = room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
                const extensions = room.GetOwnedStructures<StructureExtension>(STRUCTURE_EXTENSION)

                const deposit_places = [spawn, ...extensions]

                const deposit = creep.transfer(spawn, RESOURCE_ENERGY)

                if (deposit === ERR_NOT_IN_RANGE) {
                    creep.moveTo(deposit_places[0])
                }
            }
            else if (harvest_result === ERR_NOT_IN_RANGE) {
                creep.moveTo(source)
            }
        }

    }

    Save(creep: Creep): void {
        const data = HardDrive.Read(creep.name) as JsonObj
        data.behavior = this.m_Source_id
        HardDrive.Write(creep.name, data)
    }

    ClearDiskData(creep: Creep): void {
        HardDrive.Erase(creep.name)
    }

}