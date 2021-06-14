import { RoomWrapper } from "../Room/RoomWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class BuildBehavior implements CreepBehavior {
    Destroy(creep: Creep): void {
        throw new Error("Method not implemented.");
    }
    Load(creep: Creep): void {
        throw new Error("Method not implemented.");
    }
    Save(creep: Creep): void {
        throw new Error("Method not implemented.");
    }
    Behavior(creep: Creep, room: RoomWrapper): void {
        throw new Error("Method not implemented.");
    }


}