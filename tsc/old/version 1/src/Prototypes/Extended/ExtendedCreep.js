"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedCreep = void 0;
class ExtendedCreep extends Creep {
    Get(id) {
        return Game.getObjectById(id);
    }
}
exports.ExtendedCreep = ExtendedCreep;
