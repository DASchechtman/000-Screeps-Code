import { Behavior } from "../../consts/CreepBehaviorConsts"
import { PriorityQueue } from "../datastructures/PriorityQueue"
import { CreepWrapper } from "../../core/CreepWrapper"
import { RoomWrapper } from "../../core/room/RoomWrapper"

enum PriorityLevel {
    ULTRA_HIGH,
    HIGH,
    MED,
    LOW,
    ULTRA_LOW
}

interface RolePriority {
    behavior: number,
    priority: number
}

interface CreepAmmount {
    current: number,
    max: number | null
}


export class Spawner {
    private m_Type_tracker: Map<number, CreepAmmount>
    private m_Room: RoomWrapper

    constructor(room: RoomWrapper) {

        this.m_Type_tracker = new Map()
        this.m_Room = room
    }

    private HavesterRule(): RolePriority[] {
        const limit = 2
        const creep_list: RolePriority[] = []
        const harvesters_alive = this.m_Type_tracker.get(Behavior.HARVEST)!!
        harvesters_alive.max = limit

        for (let i = harvesters_alive.current; i < limit; i++) {
            const creep: RolePriority = {
                behavior: Behavior.HARVEST,
                priority: PriorityLevel.ULTRA_LOW
            }

            switch (harvesters_alive.current) {
                case 0: {
                    creep.priority = PriorityLevel.HIGH
                    break
                }
                case 1: {
                    creep.priority = PriorityLevel.MED
                    break
                }
            }

            creep_list.push(creep)
        }

        return creep_list
    }

    private UpgraderRule(): RolePriority[] {
        const limit = 2
        const creep_list: RolePriority[] = []
        const upgraders_alive = this.m_Type_tracker.get(Behavior.UPGRADER)!!
        upgraders_alive.max = limit

        for (let i = upgraders_alive.current; i < limit; i++) {
            creep_list.push({
                behavior: Behavior.UPGRADER,
                priority: PriorityLevel.MED
            })
        }

        return creep_list
    }

    private DefenderRule(): RolePriority[] {
        const num_of_hostile = this.m_Room.GetHostileCreeps().length
        const creep_list: RolePriority[] = []
        let priority_level

        if (num_of_hostile === 1) {
            priority_level = PriorityLevel.ULTRA_LOW
        }
        else if (num_of_hostile > 4) {
            priority_level = PriorityLevel.ULTRA_HIGH
        }
        else {
            priority_level = PriorityLevel.ULTRA_LOW - num_of_hostile
        }

        for (let i = 0; i < num_of_hostile; i++) {
            creep_list.push({
                behavior: Behavior.DEFENDER,
                priority: priority_level
            })
        }

        return creep_list
    }

    private BuilderRule(): RolePriority[] {
        const creep_list: RolePriority[] = []
        const num_of_construction_sites = this.m_Room.GetConstructionSites().length
        const builders_alive = this.m_Type_tracker.get(Behavior.BUILDER)!!
        builders_alive.max = 1

        if (num_of_construction_sites > 0 && builders_alive.current === 0) {
            creep_list.push({
                behavior: Behavior.BUILDER,
                priority: PriorityLevel.LOW
            })
        }

        return creep_list
    }

    private RepairRule(): RolePriority[] {
        const creep_list: RolePriority[] = []
        const filter = (struct: Structure<any>) => { return struct.hits < struct.hitsMax }
        const num_of_damaged_structs = this.m_Room.GetAllNonHostileStructs(filter).length
        const repair_alive = this.m_Type_tracker.get(Behavior.REPAIR)!!

        repair_alive.max = 1

        if (num_of_damaged_structs > 0 && repair_alive.current === 0) {
            creep_list.push({
                behavior: Behavior.REPAIR,
                priority: PriorityLevel.LOW
            })
        }

        return creep_list
    }

    public TrackCreepTypes(): void {
        for (let behavior in Behavior) {
            if (Number(behavior) !== Behavior.NONE && !this.m_Type_tracker.has(Number(behavior))) {
                this.m_Type_tracker.set(Number(behavior), { current: 0, max: null })
            }
        }

        const creep_list = this.m_Room.GetMyCreeps()

        for (const creep of creep_list) {
            const wrapper = new CreepWrapper(creep.name)
            wrapper.OnTickStart()
            const behavior = wrapper.GetBehavior()
            const cur_count = this.m_Type_tracker.get(behavior)!!

            if (cur_count) {
                this.m_Type_tracker.set(behavior, {
                    current: cur_count.current + 1,
                    max: cur_count.max
                })
            }
        }
    }

    public GetTrackedType(behavior: Behavior): number {
        let type = this.m_Type_tracker.get(behavior)?.current
        if (type === undefined) {
            type = -1
        }

        return type
    }

    public GetNeededType(): number {
        let type = Behavior.NONE
        for (let [key, val] of this.m_Type_tracker) {
            if (val.max && val.current < val.max) {
                type = key
            }
        }

        return type
    }

    public UntrackCreepTypes(): void {
        this.m_Type_tracker.clear()
    }

    public CreateSpawnList(): number[] {
        const queue = new PriorityQueue<RolePriority>((el) => { return el.priority })
        let harvest_list = this.HavesterRule()
        queue.PushArray(harvest_list)
        queue.PushArray(this.UpgraderRule())
        queue.PushArray(this.DefenderRule())
        queue.PushArray(this.BuilderRule())
        queue.PushArray(this.RepairRule())

        let arr = queue.ToHeap().Map((val) => { return val.behavior })
        return arr
    }
}