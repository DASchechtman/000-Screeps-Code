import { JsonObj } from "../../CompilerTyping/Interfaces";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { StructureBehavior } from "./StructureBehavior";

export class TowerBehavior extends StructureBehavior{

    private m_Data: JsonObj = {}

    Load(struct: StructureTower): void {
        const data = this.GetBehavior(struct)

        const tick = data.tick === undefined ? 0 : data.tick
        const id = data.id === undefined ? "" : data.id

        this.m_Data

    }

    Run(struct: StructureTower, room: RoomWrapper): void {
        
    }

    Save(struct: StructureTower): void {
        
    }

}