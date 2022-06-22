import { ActionDistance } from "../../../consts/CreepBehaviorConsts"
import { SignalMessage } from "../../../types/Interfaces"
import { RoomPos } from "../../../types/Types"
import { HardDrive } from "../../../utils/harddrive/HardDrive"
import { InRoomPathFinder } from "../../../utils/navigation/InRoomPathFinder"
import { CreepWrapper } from "../../creep/CreepWrapper"
import { RoomWrapper } from "../../room/RoomWrapper"
import { SourceWrapper } from "../../SourceWrapper"



export abstract class CreepBehavior {

    private m_Wrapper: CreepWrapper

    constructor(wrapper: CreepWrapper) {
        this.m_Wrapper = wrapper
    }

    /**
     * 
     * @param creep 
     * will only be called once on the creation of a creep wrapper or
     * upon the switch to a new behavior
     */
    abstract InitCreep(creep: Creep): void

    // the 3 methods below will be called once every tick
    abstract InitTick(creep: Creep): void
    abstract RunTick(creep: Creep, room: RoomWrapper): void
    abstract FinishTick(creep: Creep): void

    /**
     * 
     * @param creep 
     * will only be called once on the death of a creep
     */
    abstract DestroyCreep(creep: Creep | null): void

    ReceiveSignal(signal: SignalMessage): boolean {
        return false
    }

    ClearDiskData(creep: Creep): void {
        HardDrive.DeleteFolder(this.GetFolderPath(creep))
    }

    private SourceNextTo(creep: Creep, sources: Source[]): Source | null {
        let possible_source = null

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

    protected GetSource(creep: Creep, room: RoomWrapper): Source | null {
        let i = 0
        const sources = room.GetSources()

        let correct_source = this.SourceNextTo(creep, sources)

        if (correct_source === undefined) {

            for (let source of sources) {
                const wrapper = new SourceWrapper(source.id)
                if (wrapper.HasFreeSpot()) {
                    correct_source = source
                }
            }
        }

        return correct_source
    }

    protected Harvest(source: Source, room: RoomWrapper): number {
        let moved = 0
        const can_harvest = new SourceWrapper(source.id).HasFreeSpot()
        const creep = this.m_Wrapper.GetCreep()

        if (creep) {
            const is_close_to_source = creep.pos.inRangeTo(source, ActionDistance.HARVEST)
            const path_finder = new InRoomPathFinder()

            if (can_harvest && !is_close_to_source) {
                path_finder.GeneratePath(this.m_Wrapper, source, ActionDistance.HARVEST)
                if (!path_finder.MoveTo(this.m_Wrapper)) {
                    moved = 1
                    creep.harvest(source)
                }
            }
            else if (is_close_to_source) {
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