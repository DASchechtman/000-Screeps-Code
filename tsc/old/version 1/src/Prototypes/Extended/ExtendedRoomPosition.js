"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedRoomPosition = void 0;
class ExtendedRoomPosition extends RoomPosition {
    ToPoint() {
        return {
            x: this.x,
            y: this.y
        };
    }
}
exports.ExtendedRoomPosition = ExtendedRoomPosition;
