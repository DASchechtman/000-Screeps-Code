"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TowerBehavior = void 0;
const StructureBehavior_1 = require("./StructureBehavior");
class TowerBehavior extends StructureBehavior_1.StructureBehavior {
    Load(struct) {
    }
    Run(struct, room) {
        const tower = struct;
    }
    Save(struct) {
    }
}
exports.TowerBehavior = TowerBehavior;
