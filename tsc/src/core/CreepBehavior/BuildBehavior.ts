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
    private m_Site_queue: PriorityQueue<ConstructionSite>

    constructor(wrapper: CreepWrapper) {
        super(wrapper)
        this.m_Site_queue = new PriorityQueue((el) => {
            let sort_val = 50000
            if (el.structureType === STRUCTURE_EXTENSION) {
                sort_val = 25000
            }
            else if (el.structureType === STRUCTURE_WALL || el.structureType === STRUCTURE_RAMPART) {
                sort_val = 0
            }
            return sort_val + this.m_Site_queue.Size()
        })
    }

    InitCreep(creep: Creep): void {}

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
        const sites = room.GetConstructionSites()[0]

        if (sites) {
            const build_site = sites
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
            this.ClearDiskData(creep)
            creep.suicide()
        }
    }

    FinishTick(creep: Creep): void {
        HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data) 
    }

    DestroyCreep(creep: Creep | null): void {}


    private Build(creep: Creep, build_site: ConstructionSite): void {
        if (!this.MoveTo(ActionDistance.BUILD, build_site)) {
            creep.build(build_site)
        }
    }

    private FillQueue(room: RoomWrapper){
        const sites = room.GetConstructionSites()

        for (let s of sites) {
            this.m_Site_queue.Push(s)
        }

    }

}