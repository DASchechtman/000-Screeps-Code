"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureWrapper = void 0;
const CreepBehaviorConsts_1 = require("../../consts/CreepBehaviorConsts");
const GameConstants_1 = require("../../consts/GameConstants");
const ColonyMember_1 = require("../ColonyMember");
class StructureWrapper extends ColonyMember_1.ColonyMember {
    constructor(struct_id, type = GameConstants_1.GameEntityTypes.STRUCT) {
        super(type, struct_id);
        this.m_Repair_creep_id = null;
    }
    GetWrapperStruct() {
        const id = this.m_Id;
        return Structure.prototype.Get(id);
    }
    OnTickRun() {
        if (this.GetCurHealth() < this.GetMaxHealth()) {
            this.m_Signal = {
                data: CreepBehaviorConsts_1.Behavior.REPAIR,
                sender: this,
            };
            if (this.m_Repair_creep_id) {
                this.m_Signal.reciever_name = this.m_Repair_creep_id;
            }
            else {
                this.m_Signal.receiver_type = GameConstants_1.GameEntityTypes.CREEP;
            }
        }
    }
    OnTickStart() { }
    OnTickEnd() { }
    OnDestroy() { }
    ReceiveSignal(signal) {
        let was_processed = false;
        if (signal.sender.GetType() === GameConstants_1.GameEntityTypes.CREEP) {
            const creep = signal.sender;
            if (creep.GetBehavior() === CreepBehaviorConsts_1.Behavior.REPAIR
                && typeof signal.data === 'string'
                && this.m_Repair_creep_id !== signal.data) {
                this.m_Repair_creep_id = signal.data;
                was_processed = true;
            }
        }
        return was_processed;
    }
    GetCurHealth() {
        const struct = this.GetWrapperStruct();
        return struct ? struct.CurHealth() : Number.MAX_SAFE_INTEGER;
    }
    GetMaxHealth() {
        const struct = this.GetWrapperStruct();
        return struct ? struct.MaxHealth() : Number.MAX_SAFE_INTEGER;
    }
    GetStructure() {
        return this.GetWrapperStruct();
    }
    GetStructType() {
        var _a;
        return (_a = this.GetWrapperStruct()) === null || _a === void 0 ? void 0 : _a.structureType;
    }
}
exports.StructureWrapper = StructureWrapper;
