"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepWrapper = void 0;
const CreepBehaviorConsts_1 = require("../../consts/CreepBehaviorConsts");
const GameConstants_1 = require("../../consts/GameConstants");
const HardDrive_1 = require("../../utils/harddrive/HardDrive");
const ColonyMember_1 = require("../ColonyMember");
const BuildBehavior_1 = require("./CreepBehavior/BuildBehavior");
const DefendBehavior_1 = require("./CreepBehavior/DefendBehavior");
const HarvestBehavior_1 = require("./CreepBehavior/HarvestBehavior");
const RepairBehavior_1 = require("./CreepBehavior/RepairBehavior");
const UpgradeBehavior_1 = require("./CreepBehavior/UpgradeBehavior");
const RoomWrapper_1 = require("../room/RoomWrapper");
class CreepWrapper extends ColonyMember_1.ColonyMember {
    constructor(creep_name) {
        super(GameConstants_1.GameEntityTypes.CREEP, creep_name);
        this.behaviors = new Map();
        this.m_Behavior_type = CreepBehaviorConsts_1.Behavior.NONE;
        this.m_Behavior = undefined;
        this.m_Creep = undefined;
        this.m_Not_run_yet = true;
        this.m_Name = creep_name;
        const creep = this.GetCreep();
        if (creep) {
            this.m_Base_path = HardDrive_1.HardDrive.Join(creep.room.name, this.m_Name);
            this.type_file_path = HardDrive_1.HardDrive.Join(this.m_Base_path, "creep-type", "type");
        }
        else {
            this.type_file_path = "";
            this.m_Base_path = "";
        }
        if (this.behaviors.size === 0) {
            this.behaviors.set(CreepBehaviorConsts_1.Behavior.HARVEST, new HarvestBehavior_1.HarvestBehavior(this));
            this.behaviors.set(CreepBehaviorConsts_1.Behavior.UPGRADER, new UpgradeBehavior_1.UpgradeBehavior(this));
            this.behaviors.set(CreepBehaviorConsts_1.Behavior.DEFENDER, new DefendBehavior_1.DefendBehavior(this));
            this.behaviors.set(CreepBehaviorConsts_1.Behavior.BUILDER, new BuildBehavior_1.BuildBehavior(this));
            this.behaviors.set(CreepBehaviorConsts_1.Behavior.REPAIR, new RepairBehavior_1.RepairBehavior(this));
        }
    }
    GetCreep() {
        if (!this.m_Creep) {
            this.m_Creep = Game.creeps[this.m_Name];
        }
        return this.m_Creep;
    }
    OnTickStart() {
        const type = HardDrive_1.HardDrive.ReadFile(this.type_file_path);
        if (typeof type === 'number') {
            this.m_Behavior_type = type;
            this.m_Behavior = this.behaviors.get(this.m_Behavior_type);
        }
    }
    OnTickRun() {
        var _a;
        const creep = this.GetCreep();
        if (creep && this.m_Behavior) {
            const room = new RoomWrapper_1.RoomWrapper(creep.room.name);
            if (this.m_Not_run_yet) {
                this.m_Behavior.InitCreep(creep);
                this.m_Not_run_yet = false;
            }
            this.m_Behavior.InitTick(creep);
            this.m_Behavior.RunTick(creep, room);
            this.m_Behavior.FinishTick(creep);
        }
        else {
            (_a = this.m_Behavior) === null || _a === void 0 ? void 0 : _a.DestroyCreep(null);
            HardDrive_1.HardDrive.DeleteFolder(this.m_Base_path);
            this.m_Signal = {
                data: this.m_Name,
                sender: this,
                receiver_type: GameConstants_1.GameEntityTypes.COLONY
            };
        }
    }
    OnTickEnd() {
        HardDrive_1.HardDrive.WriteFile(this.type_file_path, CreepBehaviorConsts_1.Behavior.HARVEST);
    }
    OnDestroy() {
        this.m_Creep = undefined;
    }
    ReceiveSignal(signal) {
        let was_processed = false;
        if (this.m_Behavior) {
            was_processed = this.m_Behavior.ReceiveSignal(signal);
            this.m_Signal = {
                data: this.GetID(),
                sender: this,
                reciever_name: signal.sender.GetID()
            };
        }
        return was_processed;
    }
    GetBehavior() {
        return this.m_Behavior_type;
    }
    SetBehavior(new_behavior) {
        const creep = this.GetCreep();
        if (creep) {
            this.m_Not_run_yet = true;
            this.m_Behavior_type = new_behavior;
            this.m_Behavior = this.behaviors.get(new_behavior);
        }
    }
    GetPath() {
        return this.m_Base_path;
    }
}
exports.CreepWrapper = CreepWrapper;
