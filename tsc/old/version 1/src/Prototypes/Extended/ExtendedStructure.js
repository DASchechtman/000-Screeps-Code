"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedStructure = void 0;
class ExtendedStructure extends Structure {
    Get(id) {
        return Game.getObjectById(id);
    }
    CurHealth() {
        return this.GetHealthValue(this.hits);
    }
    MaxHealth() {
        return this.GetHealthValue(this.hitsMax);
    }
    RunBehavior(...args) { return 0; }
    GetHealthValue(health_val) {
        let val = Number.MAX_SAFE_INTEGER;
        if (typeof health_val === 'number' && health_val > 0) {
            val = health_val;
        }
        return val;
    }
}
exports.ExtendedStructure = ExtendedStructure;
