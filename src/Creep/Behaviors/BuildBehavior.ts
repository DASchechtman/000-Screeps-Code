import { JsonObj } from "../../CompilerTyping/Interfaces";
import { BUILD_DISTANCE } from "../../Constants/CreepBehaviorConsts";
import { PriorityQueue } from "../../DataStructures/PriorityQueue";
import { HardDrive } from "../../Disk/HardDrive";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class BuildBehavior extends CreepBehavior {
    
    private m_Data: JsonObj = {}
    private m_Site_queue: PriorityQueue<ConstructionSite>

    constructor() {
        super()
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

    Load(creep: Creep): void {
        const behavior = this.GetBehavior(creep)
        const cur_state = Boolean(behavior?.can_build)
        const source_id = String(behavior?.id)
        this.m_Data = {
            can_build: this.UpdateWorkState(creep, cur_state),
            id: source_id
        }
    }

    Run(creep: Creep, room: RoomWrapper): void {
        if (this.m_Site_queue.Size() === 0) {
            this.FillQueue(room)
        }

        const sites = this.m_Site_queue.Peek()

        if (sites) {
            const build_site = sites
            let source = Game.getObjectById(this.m_Data.id as Id<Source>)

            if (!source) {
                source = build_site.pos.findClosestByPath(FIND_SOURCES)
            }

            if (this.m_Data.can_build) {
                this.Build(creep, build_site)
            }
            else {
                this.m_Data.id = source!!.id
                this.Harvest(creep, source!!)
            }
        }
        else {
            this.ClearDiskData(creep)
            creep.suicide()
        }
    }

    Save(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        data.behavior = this.m_Data
        HardDrive.Write(creep.name, data)
    }

    private Build(creep: Creep, build_site: ConstructionSite): void {
        if (!this.MoveTo(BUILD_DISTANCE, creep, build_site)) {
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