import { JsonObj } from "../CompilerTyping/Interfaces";
import { RoomWrapper } from "../Room/RoomWrapper";
import { SharedBehavior } from "./SharedBehavior";


export class SharedRepairBehavior extends SharedBehavior {
    private m_Data: JsonObj = {}
    
    Load(id: string): void {
        const data_behavior = this.GetBehavior(id)
        const cur_state = data_behavior?.full === undefined ? false : data_behavior.full as boolean
    }
    Run(id: string, room: RoomWrapper): void {
        const obj_id = id as Id<Creep | StructureTower>
        const repairer = Game.getObjectById(obj_id)
    }
    Save(id: string): void {
        
    }

}