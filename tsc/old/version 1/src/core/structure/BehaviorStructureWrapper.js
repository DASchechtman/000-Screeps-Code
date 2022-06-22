"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorStructureWrapper = void 0;
const GameConstants_1 = require("../../consts/GameConstants");
const RoomWrapper_1 = require("../room/RoomWrapper");
const SpawnBehavior_1 = require("./StructBehavior/SpawnBehavior");
const StructureWrapper_1 = require("./StructureWrapper");
class BehaviorStructureWrapper extends StructureWrapper_1.StructureWrapper {
    constructor(struct) {
        super(struct, GameConstants_1.GameEntityTypes.BEHAVIOR_STRUCT);
        this.m_Behavior = null;
        this.m_Behavior_types = new Map();
        this.m_Behavior_types.set(STRUCTURE_SPAWN, new SpawnBehavior_1.SpawnBehavior());
        const type = this.GetStructType();
        if (typeof type === 'string' && this.m_Behavior_types.has(type)) {
            this.m_Behavior = this.m_Behavior_types.get(type);
        }
    }
    OnTickRun() {
        var _a, _b, _c, _d, _e;
        super.OnTickRun();
        const struct = this.GetStructure();
        if (this.m_Behavior && struct) {
            const behavior_struct = struct;
            const room = new RoomWrapper_1.RoomWrapper(struct.room.name);
            (_a = this.m_Behavior) === null || _a === void 0 ? void 0 : _a.InitTick(behavior_struct);
            (_b = this.m_Behavior) === null || _b === void 0 ? void 0 : _b.RunTick(behavior_struct, room);
            (_c = this.m_Behavior) === null || _c === void 0 ? void 0 : _c.FinishTick(behavior_struct);
            if ((_d = this.m_Behavior) === null || _d === void 0 ? void 0 : _d.GetData()) {
                this.m_Signal = {
                    data: this.m_Behavior.GetData(),
                    sender: this,
                    receiver_type: GameConstants_1.GameEntityTypes.COLONY
                };
            }
            (_e = this.m_Behavior) === null || _e === void 0 ? void 0 : _e.ClearData();
        }
    }
}
exports.BehaviorStructureWrapper = BehaviorStructureWrapper;
