import { BUILDER_BEHAVIOR, DEFENDER_BEHAVIOR, HARVEST_BEHAVIOR, UPGRADER_BEHAVIOR } from "../Constants/CreepBehaviorConsts"
import { Stack } from "../DataStructures/Stack"
import { RoomWrapper } from "../Room/RoomWrapper"
import { CreepTypeTracker } from "./CreepTypeTracker"

export class CreepTypeQueue {
    private m_Max_types: Map<number, number>

    constructor(room: RoomWrapper) {

        const num_of_sits = room.GetConstructionSites().length
        this.m_Max_types = new Map()

        this.m_Max_types.set(HARVEST_BEHAVIOR, 2)
        this.m_Max_types.set(UPGRADER_BEHAVIOR, 2)
        this.m_Max_types.set(BUILDER_BEHAVIOR, (num_of_sits > 0) ? 1 : 0)
        this.m_Max_types.set(DEFENDER_BEHAVIOR, room.GetHostileCreeps().length * 2)
    }

    private CreateList(type: number, count: number, iterator: number): Array<number> {
        const list = new Array<number>()

        for (let i = count; i < iterator; i++) {
            list.push(type)
        }

        return list
    }

    CreateStack(tracker: CreepTypeTracker): Stack<number> {
        const queue = new Stack<number>()

        const cur_harvester = tracker.GetTypeCount(HARVEST_BEHAVIOR)
        const cur_upgrader = tracker.GetTypeCount(UPGRADER_BEHAVIOR)
        const cur_builder = tracker.GetTypeCount(BUILDER_BEHAVIOR)
        const cur_defenders = tracker.GetTypeCount(DEFENDER_BEHAVIOR)

        const max_harvest = this.m_Max_types.get(HARVEST_BEHAVIOR)!!
        const max_upgrader = this.m_Max_types.get(UPGRADER_BEHAVIOR)!!
        const max_builder = this.m_Max_types.get(BUILDER_BEHAVIOR)!!
        const max_defender = this.m_Max_types.get(DEFENDER_BEHAVIOR)!!

        const list = [
            ...this.CreateList(HARVEST_BEHAVIOR, cur_harvester, max_harvest),
            ...this.CreateList(UPGRADER_BEHAVIOR, cur_upgrader, max_upgrader),
            ...this.CreateList(BUILDER_BEHAVIOR, cur_builder, max_builder),
            ...this.CreateList(DEFENDER_BEHAVIOR, cur_defenders, max_defender)
        ]

        for (let item of list) {
            queue.Push(item)
        }


        return queue
    }

    GetMax(type: number) {
        let count = -1;
        if (this.m_Max_types.has(type)) {
            count = this.m_Max_types.get(type)!!
        }
        return count
    }
}