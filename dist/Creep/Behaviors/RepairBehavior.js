"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../Constants/CreepBehaviorConsts");
const PriorityStructuresStack_1 = require("../../DataStructures/PriorityStructuresStack");
const HardDrive_1 = require("../../Disk/HardDrive");
const CreepBehavior_1 = require("./CreepBehavior");
class RepairBehavior extends CreepBehavior_1.CreepBehavior {
    constructor() {
        super(...arguments);
        this.m_Data = {};
        this.m_Struct_Stack = new PriorityStructuresStack_1.PriorityStructuresStack();
        this.m_Max_time = 10;
    }
    Load(creep) {
        const data_behavior = this.GetBehavior(creep);
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
    Run(creep, room) {
        debugger;
        let source = Game.getObjectById(this.m_Data.source_id);
        if (this.m_Data.full) {
            const id = this.SetStruct();
            const struct = Game.getObjectById(id);
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
            }
            if (source) {
                this.m_Data.source_id = source.id;
                this.Harvest(creep, source);
            }
        }
    }
    Save(creep) {
        const data = HardDrive_1.HardDrive.Read(creep.name);
        data.behavior = this.m_Data;
        HardDrive_1.HardDrive.Write(creep.name, data);
    }
    Signal(signal) {
        debugger;
        this.m_Struct_Stack.Add(signal.from);
        return true;
    }
    Repair(creep, struct) {
        if (!this.MoveTo(CreepBehaviorConsts_1.REPAIR_DISTANCE, creep, struct)) {
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
        if (this.m_Data.new_id) {
            const struct_wrapper = this.m_Struct_Stack.Pop();
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
