import { Point } from "../../types/Interfaces";

export class ExtendedRoomPosition extends RoomPosition {
    ToPoint(): Point {
        return {
            x: this.x,
            y: this.y
        }
    } 
}