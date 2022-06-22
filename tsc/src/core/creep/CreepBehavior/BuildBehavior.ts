import { ActionDistance } from "../../../consts/CreepBehaviorConsts"
import { PriorityQueue } from "../../../utils/datastructures/PriorityQueue"
import { JsonMap } from "../../../utils/harddrive/JsonTreeNode"
import { CreepWrapper } from "../../creep/CreepWrapper"
import { RoomWrapper } from "../../room/RoomWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class BuildBehavior extends CreepBehavior {

    private m_Site_queue: PriorityQueue<Id<ConstructionSite>>
    private b_can_build = false
    private s_source_id = ""
    private s_site_id = ""
    private readonly s_can_build_key = "can build"
    private readonly s_site_id_key = "site id"
    private readonly s_source_id_key = "source id"

    constructor(wrapper: CreepWrapper, behavior_data: JsonMap) {
        super(wrapper, behavior_data)
        this.m_Site_queue = new PriorityQueue((el) => {
            let sort_val = 50000
            const site = Game.getObjectById(el)
            if (site === null) {
                sort_val = Number.MAX_SAFE_INTEGER
            }
            else if (site!!.structureType === STRUCTURE_EXTENSION) {
                sort_val = 25000
            }
            else if (site!!.structureType === STRUCTURE_WALL || site!!.structureType === STRUCTURE_RAMPART) {
                sort_val = 0
            }
            return sort_val + this.m_Site_queue.Size()
        })
    }

    InitCreep(creep: Creep): void { }

    InitTick(creep: Creep): void {
        this.b_can_build = this.GetJsonDataIfAvalible(this.s_can_build_key, this.b_can_build) as boolean
        this.s_site_id = this.GetJsonDataIfAvalible(this.s_site_id_key, this.s_site_id) as string
        this.s_source_id = this.GetJsonDataIfAvalible(this.s_source_id_key, this.s_source_id) as string 
    }

    RunTick(creep: Creep, room: RoomWrapper): void {

        this.m_Site_queue.PushArray(room.GetConstructionSites().map(s => s.id))

        let site: ConstructionSite | null = null

        const size = this.m_Site_queue.Size()
        for (let i = 0; i < size; i++) {
            site = Game.getObjectById(this.m_Site_queue.Peek()!!)
            if (site) {
                break
            }
            else {
                this.m_Site_queue.Pop()
            }
        }

        console.log("builder info", size, site)

        if (site) {
            const build_site = site
            let source = Game.getObjectById(this.s_source_id as Id<Source>)

            if (!source) {
                source = build_site.pos.findClosestByPath(FIND_SOURCES)
                if (source) {
                    this.s_source_id = source.id
                }
                else {
                    console.log("error repair builder behavior: can't find source")
                }
            }

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                this.b_can_build = false
            }
            else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity()) {
                this.b_can_build = true
            }

            if (this.b_can_build) {
                this.Build(creep, build_site)
            }
            else {
                this.Harvest(source!!, room)
            }
        }
        
    }

    FinishTick(creep: Creep): void {
        this.m_Site_queue.Clear()
        this.StoreDataInJsonMap(
            [this.s_site_id_key, this.s_can_build_key, this.s_source_id_key], 
            [this.s_site_id, this.b_can_build, this.s_source_id]
            )
    }

    DestroyCreep(creep: Creep | null): void { }


    private Build(creep: Creep, build_site: ConstructionSite): void {
        this.MoveTo(creep, build_site, ActionDistance.BUILD, ()=> {
            if (creep.build(build_site) === ERR_INVALID_TARGET) {
                this.m_Site_queue.Pop()
            }
        })
    }

}