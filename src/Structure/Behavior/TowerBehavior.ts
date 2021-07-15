import { RoomWrapper } from "../../Room/RoomWrapper";
import { StructureBehavior } from "./StructureBehavior";

export class TowerBehavior extends StructureBehavior{

    Load(struct: Structure<StructureConstant>): void {
        
    }

    Run(struct: Structure<StructureConstant>, room: RoomWrapper): void {
        const tower = struct as StructureTower
    }

    Save(struct: Structure<StructureConstant>): void {
        
    }

}