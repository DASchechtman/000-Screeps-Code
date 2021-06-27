import { BUILDER_TYPE, DEFENDER_TYPE, HARVEST_TYPE, UPGRADER_TYPE } from "../Creep/CreepTypes"
import { Stack } from "../DataStructures/Stack"
import { RoomWrapper } from "../Room/RoomWrapper"
import { CreepTypeTracker } from "./CreepTypeTracker"

export class CreepTypeQueue {
    private m_Max_types: Map<number, number>

    constructor(room: RoomWrapper) {

        const num_of_sits = room.GetConstructionSites().length
        this.m_Max_types = new Map()

        this.m_Max_types.set(HARVEST_TYPE, 2)
        this.m_Max_types.set(UPGRADER_TYPE, 2)
        this.m_Max_types.set(BUILDER_TYPE, (num_of_sits > 0) ? 1 : 0)
        this.m_Max_types.set(DEFENDER_TYPE, room.GetHostileCreeps().length * 2)
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

        const cur_harvester = tracker.GetTypeCount(HARVEST_TYPE)
        const cur_upgrader = tracker.GetTypeCount(UPGRADER_TYPE)
        const cur_builder = tracker.GetTypeCount(BUILDER_TYPE)
        const cur_defenders = tracker.GetTypeCount(DEFENDER_TYPE)

        const list = [
            ...this.CreateList(HARVEST_TYPE, cur_harvester, this.m_Max_types.get(HARVEST_TYPE)!!),
            ...this.CreateList(UPGRADER_TYPE, cur_upgrader, this.m_Max_types.get(UPGRADER_TYPE)!!),
            ...this.CreateList(BUILDER_TYPE, cur_builder, this.m_Max_types.get(BUILDER_TYPE)!!),
            ...this.CreateList(DEFENDER_TYPE, cur_defenders, this.m_Max_types.get(DEFENDER_TYPE)!!)
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