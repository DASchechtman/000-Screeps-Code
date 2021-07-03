import { HardDrive } from "../../Disk/HardDrive";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class BuildBehavior extends CreepBehavior {
    
    private m_Can_build = false

    Load(creep: Creep): void {
        const data = HardDrive.Read(creep.name)
        const cur_state = Boolean(data.behavior)
        this.m_Can_build = this.UpdateWorkState(creep, cur_state)
    }

    Run(creep: Creep, room: RoomWrapper): void {
        const sites = room.GetConstructionSites()

        if (sites.length > 0) {
            const build_site = sites[0]
            const source = room.GetSources()[0]

            if (this.m_Can_build) {
                this.Build(creep, build_site)
            }
            else {
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
        data.behavior = this.m_Can_build
        HardDrive.Write(creep.name, data)
    }

    private Build(creep: Creep, build_site: ConstructionSite): void {
        this.MoveTo(creep.build(build_site), creep, build_site)
    }

}