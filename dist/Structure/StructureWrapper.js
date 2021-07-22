"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureWrapper = void 0;
const CreepBehaviorConsts_1 = require("../Constants/CreepBehaviorConsts");
const GameObjectConsts_1 = require("../Constants/GameObjectConsts");
const GameObject_1 = require("../GameObject");
const SignalManager_1 = require("../Signals/SignalManager");
class StructureWrapper extends GameObject_1.GameObject {
    constructor(struct_id, type = GameObjectConsts_1.STRUCTURE_TYPE) {
        var _a, _b;
        const struct = Game.getObjectById(struct_id);
        const should_run = Boolean(struct && struct.hits && struct.hitsMax && struct.hits < struct.hitsMax);
        super(struct_id, type, 0, should_run, false);
        this.m_Struct_id = struct_id;
        this.m_Struct = struct;
        this.m_Cur_health = 0;
        this.m_Max_health = 0;
        if (((_a = this.m_Struct) === null || _a === void 0 ? void 0 : _a.hits) && ((_b = this.m_Struct) === null || _b === void 0 ? void 0 : _b.hitsMax)) {
            this.m_Cur_health = this.m_Struct.hits;
            this.m_Max_health = this.m_Struct.hitsMax;
        }
    }
    OnLoad() {
        if (this.m_Cur_health < this.m_Max_health) {
            const signal = {
                from: this,
                data: {},
                filter: (sender, reciever) => {
                    const type = reciever.SignalRecieverType();
                    let ret = false;
                    if (type === GameObjectConsts_1.CREEP_TYPE) {
                        const creep = reciever;
                        ret = (creep.GetBehavior() === CreepBehaviorConsts_1.REPAIR_BEHAVIOR);
                    }
                    return ret;
                }
            };
            SignalManager_1.SignalManager.Inst().SendSignal(signal);
        }
    }
    GetCurHealth() {
        return this.m_Cur_health;
    }
    GetMaxHealth() {
        return this.m_Max_health;
    }
    GetStructure() {
        return this.m_Struct;
    }
}
exports.StructureWrapper = StructureWrapper;
