import { JsonObj } from "../../CompilerTyping/Interfaces";
import { HardDrive } from "../../Disk/HardDrive";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class BuildBehavior extends CreepBehavior {
    
    private m_Data: JsonObj = {}

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
        const sites = room.GetConstructionSites()

        if (sites.length > 0) {
            const build_site = sites[0]
            let source = Game.getObjectById(this.m_Data.id as Id<Source>)

            if (!source) {
                source = build_site.pos.findClosestByPath(FIND_SOURCES)
            }

            if (this.m_Data.can_build) {
                this.Build(creep, build_site)
            }
            else if(source) {
                this.m_Data.id = source.id
                this.Harvest(creep, source)
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
        if (!this.MoveTo(3, creep, build_site)) {
            creep.build(build_site)
        }
    }

}