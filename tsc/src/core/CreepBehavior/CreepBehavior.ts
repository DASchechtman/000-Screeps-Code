import { ActionDistance } from "../../consts/CreepBehaviorConsts"
import { JsonObj, Signal, SignalMessage } from "../../types/Interfaces"
import { RoomPos } from "../../types/Types"
import { HardDrive } from "../../utils/harddrive/HardDrive"
import { InRoomPathFinder } from "../../utils/navigation/InRoomPathFinder"
import { ColonyMember } from "../ColonyMember"
import { CreepWrapper } from "../CreepWrapper"
import { RoomWrapper } from "../room/RoomWrapper"
import { SourceWrapper } from "../SourceWrapper"



export abstract class CreepBehavior {

    private m_Wrapper: CreepWrapper

    constructor(wrapper: CreepWrapper) {
        this.m_Wrapper = wrapper
    }

    abstract Load(creep: Creep): void
    abstract Run(creep: Creep, room: RoomWrapper): void
    abstract Save(creep: Creep): void
    abstract Destroy(creep: Creep): void

    ReceiveSignal(signal: SignalMessage): boolean {
        return false
    }

    ClearDiskData(creep: Creep): void {
        HardDrive.DeleteFolder(this.GetFolderPath(creep))
    }

    private SourceNextTo(creep: Creep, sources: Array<Source>): Source | undefined {
        let possible_source = undefined

        for (let source of sources) {
            let next_to_source = creep.pos.inRangeTo(source, ActionDistance.HARVEST)
            if (next_to_source) {
                possible_source = source
                break
            }
        }

        return possible_source
    }

    protected MoveTo(distance: number, location: RoomPos) {
        const p = new InRoomPathFinder()
        p.GeneratePath(this.m_Wrapper, location, distance)
        return p.MoveTo(this.m_Wrapper)

    }

    protected GetSource(creep: Creep, room: RoomWrapper): Source {
        let i = 0
        const sources = room.GetSources()

        let correct_source = this.SourceNextTo(creep, sources)

        if (correct_source === undefined) {
            correct_source = sources[i]
            let wrapper = new SourceWrapper(correct_source.id)

            while (!wrapper.HasFreeSpot()) {
                i++
                if (i < sources.length) {
                    correct_source = sources[i]
                    wrapper = new SourceWrapper(correct_source.id)
                }
                else {
                    break
                }
            }
        }

        return correct_source
    }

    protected Harvest(source: Source): number {
        let moved = 0
        const can_harvest = new SourceWrapper(source.id).HasFreeSpot()
        const creep = this.m_Wrapper.GetCreep()

        if (creep) {
            const is_close_to_source = creep.pos.inRangeTo(source, ActionDistance.HARVEST)
            const path_finder = new InRoomPathFinder()

            if (can_harvest) {
                path_finder.GeneratePath(this.m_Wrapper, source, ActionDistance.HARVEST)
                if (!path_finder.MoveTo(this.m_Wrapper)) {
                    moved = 1
                    creep.harvest(source)
                }
            }
            else if (!can_harvest && is_close_to_source) {
                creep.harvest(source)
            }
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

    protected GetFolderPath(creep: Creep) {
        return HardDrive.Join(this.m_Wrapper.GetPath(), "behavior-data")
    }
}