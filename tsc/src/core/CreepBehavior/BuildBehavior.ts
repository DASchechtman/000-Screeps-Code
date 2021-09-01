import { values } from "lodash"
import { ActionDistance } from "../../consts/CreepBehaviorConsts"
import { JsonObj, SignalMessage } from "../../types/Interfaces"
import { JsonType } from "../../types/Types"
import { PriorityQueue } from "../../utils/datastructures/PriorityQueue"
import { HardDrive } from "../../utils/harddrive/HardDrive"
import { CreepWrapper } from "../CreepWrapper"
import { RoomWrapper } from "../room/RoomWrapper"
import { SourceWrapper } from "../SourceWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class BuildBehavior extends CreepBehavior {

    private m_Data: JsonObj = {}
    private m_Site_queue: PriorityQueue<Id<ConstructionSite>>

    constructor(wrapper: CreepWrapper) {
        super(wrapper)
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
        const behavior = HardDrive.ReadFolder(this.GetFolderPath(creep))
        const cur_state = Boolean(behavior?.can_build)
        const source_id = String(behavior?.id)
        this.m_Data = {
            can_build: this.UpdateWorkState(creep, cur_state),
            id: source_id
        }
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

        if (site) {
            const build_site = site
            let source = Game.getObjectById(this.m_Data.id as Id<Source>)

            if (!source) {
                source = build_site.pos.findClosestByPath(FIND_SOURCES)
                if (!new SourceWrapper(source!!.id).HasFreeSpot()) {
                    source = this.GetSource(creep, room)
                }
            }

            if (this.m_Data.can_build) {
                this.Build(creep, build_site)
            }
            else {
                this.m_Data.id = source!!.id
                this.Harvest(source!!, room)
            }
        }
        else {
            creep.suicide()
        }
    }

    FinishTick(creep: Creep): void {
        HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data)
        this.m_Site_queue.Clear()
    }

    DestroyCreep(creep: Creep | null): void { }


    private Build(creep: Creep, build_site: ConstructionSite): void {
        if (!this.MoveTo(ActionDistance.BUILD, build_site)) {
            if (creep.build(build_site) === ERR_INVALID_TARGET) {
                this.m_Site_queue.Pop()
            }
        }
    }

}