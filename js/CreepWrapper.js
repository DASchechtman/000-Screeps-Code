"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepWrapper = void 0;
const GameObjectConsts_1 = require("./GameObjectConsts");
const HardDrive_1 = require("./HardDrive");
const GameObject_1 = require("./GameObject");
const SignalManager_1 = require("./SignalManager");
const BuildBehavior_1 = require("./BuildBehavior");
const CreepBehaviorConsts_1 = require("./CreepBehaviorConsts");
const DefendBehavior_1 = require("./DefendBehavior");
const HarvestBehavior_1 = require("./HarvestBehavior");
const UpgradeBehavior_1 = require("./UpgradeBehavior");
const RepairBehavior_1 = require("./RepairBehavior");
/*
Class meant to extend functionaliyt of creep, provides fuctions like
telling when creep dies
givig creep more flexible behavior
*/
class CreepWrapper extends GameObject_1.GameObject {
    constructor(name, room) {
        super(name, GameObjectConsts_1.CREEP_TYPE, GameObjectConsts_1.MAX_SIGNALS, true, true);
        this.m_Creep_name = name;
        CreepWrapper.behavior_types = new Map();
        this.m_Behavior = null;
        this.m_Room = room;
        this.m_Creep = Game.creeps[name];
        this.m_Cur_type = CreepBehaviorConsts_1.HAS_NO_BEHAVIOR;
        this.m_Ready_to_run = false;
    }
    LoadTypes() {
        if (CreepWrapper.behavior_types.size === 0) {
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.HARVEST_BEHAVIOR, new HarvestBehavior_1.HarvestBehavior());
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.BUILDER_BEHAVIOR, new BuildBehavior_1.BuildBehavior());
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR, new DefendBehavior_1.DefendBehavior());
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.UPGRADER_BEHAVIOR, new UpgradeBehavior_1.UpgradeBehavior());
            CreepWrapper.behavior_types.set(CreepBehaviorConsts_1.REPAIR_BEHAVIOR, new RepairBehavior_1.RepairBehavior());
        }
    }
    SendRemoveNameSignal() {
        const signal = {
            from: this,
            data: { name: this.GetName() },
            filter: (sender, other) => {
                let is_right = false;
                const creeper = sender.from;
                const type = other.SignalRecieverType();
                const id = other.SignalRecieverID();
                if (type === GameObjectConsts_1.COLONY_TYPE && id === creeper.GetRoomName()) {
                    is_right = true;
                }
                return is_right;
            },
            method: (sender, reciever) => {
                reciever.RemoveFromMemory(sender.data.name);
                return true;
            }
        };
        SignalManager_1.SignalManager.Inst().SendSignal(signal);
    }
    OnLoad() {
        this.LoadTypes();
        if (this.m_Creep && this.m_Cur_type === CreepBehaviorConsts_1.HAS_NO_BEHAVIOR) {
            const data = HardDrive_1.HardDrive.Read(this.m_Creep.name);
            const behavior = data.type;
            if (typeof behavior === 'number') {
                this.m_Cur_type = behavior;
                this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
            }
        }
    }
    OnRun() {
        if (this.m_Creep && this.m_Behavior && this.m_Ready_to_run) {
            this.m_Behavior.Load(this.m_Creep);
            this.m_Behavior.Run(this.m_Creep, this.m_Room);
            this.m_Behavior.Save(this.m_Creep);
        }
        else if (!this.m_Creep) {
            HardDrive_1.HardDrive.Erase(this.m_Creep_name);
            this.SendRemoveNameSignal();
        }
    }
    OnSave() {
        if (this.m_Creep) {
            const data = HardDrive_1.HardDrive.Read(this.m_Creep_name);
            data.type = this.m_Cur_type;
            HardDrive_1.HardDrive.Write(this.m_Creep_name, data);
        }
    }
    OnInvasion() {
        this.m_Behavior = CreepWrapper.behavior_types.get(CreepBehaviorConsts_1.DEFENDER_BEHAVIOR);
    }
    OnSignal(signal) {
        let ret = true;
        if (signal.method) {
            ret = signal.method(signal, this);
        }
        else if (this.m_Behavior) {
            ret = this.m_Behavior.Signal(signal, this);
        }
        return ret;
    }
    SetBehavior(new_type) {
        this.LoadTypes();
        if (CreepWrapper.behavior_types.has(new_type)) {
            this.m_Cur_type = new_type;
            this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type);
        }
    }
    GetBehavior() {
        return this.m_Cur_type;
    }
    GetName() {
        return this.m_Creep_name;
    }
    GetRoomName() {
        return this.m_Room.GetName();
    }
    HasBehavior() {
        return Boolean(this.m_Behavior);
    }
    MakeReadyToRun() {
        this.m_Ready_to_run = true;
    }
    GetPos() {
        var _a;
        return (_a = this.m_Creep) === null || _a === void 0 ? void 0 : _a.pos;
    }
}
exports.CreepWrapper = CreepWrapper;
