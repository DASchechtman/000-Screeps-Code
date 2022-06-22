"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../../consts/CreepBehaviorConsts");
const GameConstants_1 = require("../../../consts/GameConstants");
const PriorityStructuresStack_1 = require("../../../utils/datastructures/PriorityStructuresStack");
const HardDrive_1 = require("../../../utils/harddrive/HardDrive");
const SourceWrapper_1 = require("../../SourceWrapper");
const CreepBehavior_1 = require("./CreepBehavior");
class RepairBehavior extends CreepBehavior_1.CreepBehavior {
    constructor(wrapper) {
        super(wrapper);
        this.m_Data = {};
        this.m_Struct_Stack = null;
        this.m_Max_time = 10;
    }
    GetStack() {
        if (!this.m_Struct_Stack) {
            this.m_Struct_Stack = new PriorityStructuresStack_1.PriorityStructuresStack();
        }
        return this.m_Struct_Stack;
    }
    InitCreep(creep) { }
    InitTick(creep) {
        const data_behavior = HardDrive_1.HardDrive.ReadFolder(this.GetFolderPath(creep));
        const cur_state = (data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.full) === undefined ? false : data_behavior.full;
        const cur_tick = typeof (data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.tick) === 'number' ? data_behavior.tick : 0;
        let new_id = data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.new_id;
        const source_id = String(data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.source_id);
        if (new_id === undefined) {
            new_id = true;
        }
        this.m_Data = {
            id: String(data_behavior === null || data_behavior === void 0 ? void 0 : data_behavior.id),
            full: this.UpdateWorkState(creep, cur_state),
            tick: cur_tick,
            new_id: new_id,
            source_id: source_id
        };
    }
    RunTick(creep, room) {
        let source = Game.getObjectById(this.m_Data.source_id);
        if (this.m_Data.full) {
            let id = this.SetStruct();
            let struct = Game.getObjectById(id);
            const stack = this.GetStack();
            // a struct can be destroyed and so not
            // exist, but other structs still do
            // and need repairing
            const size = stack.Size();
            for (let i = 0; i < size; i++) {
                if (struct) {
                    break;
                }
                id = this.SetStruct();
                struct = Game.getObjectById(id);
            }
            if (struct) {
                this.Repair(creep, struct);
            }
            else {
                creep.suicide();
            }
        }
        else {
            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (!new SourceWrapper_1.SourceWrapper(source.id).HasFreeSpot()) {
                    source = this.GetSource(creep, room);
                }
            }
            if (source) {
                this.m_Data.source_id = source.id;
                this.Harvest(source, room);
            }
        }
    }
    FinishTick(creep) {
        var _a;
        HardDrive_1.HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data);
        (_a = this.m_Struct_Stack) === null || _a === void 0 ? void 0 : _a.Clear();
    }
    DestroyCreep(creep) {
        this.m_Struct_Stack = null;
    }
    ReceiveSignal(signal) {
        let was_processed = false;
        const stack = this.GetStack();
        if ((signal.sender.GetType() === GameConstants_1.GameEntityTypes.BEHAVIOR_STRUCT
            || signal.sender.GetType() === GameConstants_1.GameEntityTypes.STRUCT
            || signal.sender.GetType() === GameConstants_1.GameEntityTypes.DEGRADABLE_STRUCT)) {
            was_processed = true;
            stack.Add(signal.sender);
        }
        return was_processed;
    }
    Repair(creep, struct) {
        if (!this.MoveTo(CreepBehaviorConsts_1.ActionDistance.REPAIR, struct)) {
            creep.repair(struct);
            this.IncCounter();
        }
    }
    IncCounter() {
        this.m_Data.tick = this.m_Data.tick + 1;
        if (this.m_Data.tick === this.m_Max_time) {
            this.m_Data.tick = 0;
            this.m_Data.new_id = true;
        }
    }
    SetStruct() {
        var _a;
        let id = this.m_Data.id;
        const stack = this.GetStack();
        if (this.m_Data.new_id) {
            const struct_wrapper = stack.Pop();
            if (struct_wrapper) {
                const new_id = String((_a = struct_wrapper.GetStructure()) === null || _a === void 0 ? void 0 : _a.id);
                this.m_Data.id = new_id;
                id = new_id;
            }
            this.m_Data.new_id = false;
        }
        return id;
    }
}
exports.RepairBehavior = RepairBehavior;
