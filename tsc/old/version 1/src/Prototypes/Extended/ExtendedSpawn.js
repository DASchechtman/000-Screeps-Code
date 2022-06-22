"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedSpawn = void 0;
class ExtendedSpawn extends StructureSpawn {
    constructor(id) {
        super(id);
        this.extended_id = 100;
        this.extended_id++;
    }
    RunBehavior(...args) {
        console.log(`spawn behavior: ${this.extended_id}`);
        return 1;
    }
}
exports.ExtendedSpawn = ExtendedSpawn;
