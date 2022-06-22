import { ActionDistance } from "../../../consts/CreepBehaviorConsts"
import { SignalMessage } from "../../../types/Interfaces"
import { RoomPos, RoomPosObj } from "../../../types/Types"
import { JsonMap, JsonTreeNode, JsonType } from "../../../utils/harddrive/JsonTreeNode"
import { CreepWrapper } from "../../creep/CreepWrapper"
import { RoomWrapper } from "../../room/RoomWrapper"
import { SourceWrapper } from "../../SourceWrapper"



export abstract class CreepBehavior {

    private m_Wrapper: CreepWrapper
    protected jm_data: JsonMap

    constructor(wrapper: CreepWrapper, behavior_data: JsonMap) {
        this.m_Wrapper = wrapper
        this.jm_data = behavior_data
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

    ClearDiskData(creep: Creep): void {}

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

    protected InRangeOf(distance: number, location: RoomPos, move_for: boolean = true) {
        let loc_x = 0
        let loc_y = 0

        try {
            loc_x = (location as RoomPosObj).pos.x
            loc_y = (location as RoomPosObj).pos.y
        }
        catch (e) {
            loc_x = (location as RoomPosition).x
            loc_y = (location as RoomPosition).y
        }

        return this.m_Wrapper.GetCreep()!!.pos.inRangeTo(loc_x, loc_y, distance)
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
        const creep = this.m_Wrapper.GetCreep()

        if (!creep) { return 1 }

        this.MoveTo(creep, source, ActionDistance.HARVEST, () => {
            creep.harvest(source)
        })

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
        return ""
    }

    protected StoreDataInJsonMap(keys: string[], vals: JsonType[]) {
        let LessThenBothLens = (i: number) => {
            return i < keys.length && i < vals.length
        }

        for (let i = 0; LessThenBothLens(i); i++) {

            if (!this.jm_data.has(keys[i])) {
                this.jm_data.set(keys[i], new JsonTreeNode(vals[i]))
            }

            this.jm_data.get(keys[i])!!.SetData(vals[i])
        }
    }

    protected GetJsonDataIfAvalible(key: string, original_val: JsonType) {
        if (this.jm_data.has(key)) {
            return this.jm_data.get(key)!!.GetData()
        }
        return original_val
    }

    protected MoveTo(creep: Creep, dest: RoomPos, distance: number, InRangeAction: () => void) {
        const in_range = this.InRangeOf(distance, dest)

        if (in_range) {
            InRangeAction()
        }
        else {
            creep.moveTo(dest)
        }
    }
}