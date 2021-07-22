"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colony = void 0;
const GameObjectConsts_1 = require("../Constants/GameObjectConsts");
const CreepBuilder_1 = require("../Creep/CreepBuilder");
const CreepBehaviorConsts_1 = require("../Constants/CreepBehaviorConsts");
const CreepWrapper_1 = require("../Creep/CreepWrapper");
const Stack_1 = require("../DataStructures/Stack");
const HardDrive_1 = require("../Disk/HardDrive");
const GameObject_1 = require("../GameObject");
const RoomWrapper_1 = require("../Room/RoomWrapper");
const SignalManager_1 = require("../Signals/SignalManager");
const CreepTypeQueue_1 = require("./CreepTypeQueue");
const CreepTypeTracker_1 = require("./CreepTypeTracker");
const StructureWrapper_1 = require("../Structure/StructureWrapper");
const TimedStructureWrapper_1 = require("../Structure/TimedStructureWrapper");
const BehaviorStructureWrapper_1 = require("../Structure/BehaviorStructureWrapper");
class Colony extends GameObject_1.GameObject {
    constructor(room_name) {
        super(room_name, GameObjectConsts_1.COLONY_TYPE, GameObjectConsts_1.MAX_SIGNALS, true, true);
        this.m_Room = new RoomWrapper_1.RoomWrapper(room_name);
        this.m_Colony_queen = this.m_Room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
        this.m_Creep_types = new Stack_1.Stack();
        this.m_Creeps_list = {};
        this.m_Data_key = "creeps";
        this.m_Creeps = new Array();
        this.m_Type_tracker = new CreepTypeTracker_1.CreepTypeTracker();
        this.m_Type_queue = new CreepTypeQueue_1.CreepTypeQueue(this.m_Room);
    }
    GetCreepNames() {
        const data = HardDrive_1.HardDrive.Read(this.m_Room.GetName());
        if (data[this.m_Data_key]) {
            this.m_Creeps_list[this.m_Data_key] = data[this.m_Data_key];
        }
        else if (!this.m_Creeps_list[this.m_Data_key]) {
            this.m_Creeps_list[this.m_Data_key] = new Array();
        }
        return this.m_Creeps_list[this.m_Data_key];
    }
    SpawnCreep(type, name) {
        var _a, _b;
        let created = false;
        if (!((_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawning)) {
            const energy_capactiy = this.m_Room.GetEnergyCapacity();
            const energy_stored = this.m_Room.GetEnergyStored();
            const creep_array = this.m_Creeps_list[this.m_Data_key];
            let body;
            if (type === CreepBehaviorConsts_1.DEFENDER_BEHAVIOR && (creep_array === null || creep_array === void 0 ? void 0 : creep_array.length) > 0) {
                body = CreepBuilder_1.CreepBuilder.BuildScalableDefender(energy_capactiy);
            }
            else if ((creep_array === null || creep_array === void 0 ? void 0 : creep_array.length) > 0) {
                body = CreepBuilder_1.CreepBuilder.BuildScalableWorker(energy_capactiy);
            }
            else {
                body = CreepBuilder_1.CreepBuilder.WORKER_BODY;
            }
            const body_energy_cost = CreepBuilder_1.CreepBuilder.GetBodyCost(body);
            if (body_energy_cost <= energy_stored) {
                (_b = this.m_Colony_queen) === null || _b === void 0 ? void 0 : _b.spawnCreep(body, name);
                created = true;
            }
        }
        return created;
    }
    CreateCreep(name, type) {
        const creep = new CreepWrapper_1.CreepWrapper(name, this.m_Room);
        creep.SetBehavior(type);
        return creep;
    }
    PushCreepAndNameToLists(creep) {
        this.m_Creeps.push(creep);
        this.GetCreepNames().push(creep.GetName());
    }
    UpdateData() {
        const behavior = this.m_Creep_types.Pop();
        return behavior;
    }
    CreateStack() {
        if (this.m_Creep_types.IsEmpty()) {
            this.m_Creep_types = this.m_Type_queue.CreateStack(this.m_Type_tracker);
        }
    }
    SpawnColonyMember() {
        var _a;
        const type = this.m_Creep_types.Peek();
        if (typeof type === 'number' && !((_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawning)) {
            const name = `creep-${Date.now()}`;
            const spawn_queued = this.SpawnCreep(type, name);
            if (spawn_queued) {
                const creep_wrap = this.CreateCreep(name, type);
                this.PushCreepAndNameToLists(creep_wrap);
                this.UpdateData();
                this.m_Type_tracker.Add(creep_wrap.GetBehavior(), creep_wrap.GetName());
            }
        }
    }
    ConvertToHarvester() {
        const creep_levels = [
            CreepTypeTracker_1.CreepTypeTracker.LEVEL_THREE,
            CreepTypeTracker_1.CreepTypeTracker.LEVEL_TWO
        ];
        for (let level of creep_levels) {
            const count = this.m_Type_tracker.GetLevelCount(level);
            if (count > 0) {
                const names = this.m_Type_tracker.GetNamesByLevel(level);
                const signal = {
                    from: this,
                    data: {
                        obj_type: GameObjectConsts_1.CREEP_TYPE,
                        creep_type: CreepBehaviorConsts_1.HARVEST_BEHAVIOR,
                        name: names[0]
                    },
                    filter: (sender, other) => {
                        const is_creep = other.SignalRecieverType() === sender.data.obj_type;
                        const same_name = other.SignalRecieverID() === sender.data.name;
                        return is_creep && same_name;
                    },
                    method: (sender, reciever) => {
                        const creep = reciever;
                        HardDrive_1.HardDrive.Erase(creep.GetName());
                        this.m_Type_tracker.Remove(creep.GetBehavior(), creep.GetName());
                        creep.SetBehavior(sender.data.creep_type);
                        this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName());
                        return true;
                    }
                };
                SignalManager_1.SignalManager.Inst().SendSignal(signal);
                break;
            }
        }
    }
    OnLoadCreeps() {
        var _a, _b;
        const creep_names = this.GetCreepNames();
        for (var creep_name of creep_names) {
            if (creep_name !== ((_b = (_a = this.m_Colony_queen) === null || _a === void 0 ? void 0 : _a.spawning) === null || _b === void 0 ? void 0 : _b.name)) {
                const wrapper = new CreepWrapper_1.CreepWrapper(creep_name, this.m_Room);
                wrapper.MakeReadyToRun();
                this.m_Creeps.push(wrapper);
            }
        }
    }
    OnLoadStructs() {
        const structs = this.m_Room.GetAllNonHostileStructs();
        for (let s of structs) {
            switch (s.structureType) {
                case STRUCTURE_ROAD:
                case STRUCTURE_RAMPART: {
                    new TimedStructureWrapper_1.TimedStructureWrapper(s.id);
                    break;
                }
                case STRUCTURE_TOWER:
                case STRUCTURE_LINK: {
                    new BehaviorStructureWrapper_1.BehaviorStructureWrapper(s.id);
                    break;
                }
                default: {
                    new StructureWrapper_1.StructureWrapper(s.id);
                    break;
                }
            }
        }
    }
    StartSafeMode() {
        var _a;
        const controller = (_a = this.m_Room) === null || _a === void 0 ? void 0 : _a.GetController();
        if (controller) {
            const still_safe = controller.safeMode;
            const avalible_safe_mode = controller.safeModeAvailable;
            const cool_down = controller.safeModeCooldown;
            if (!still_safe && avalible_safe_mode > 0 && !cool_down) {
                controller.activateSafeMode();
            }
        }
    }
    OnLoad() {
        this.OnLoadCreeps();
        this.OnLoadStructs();
    }
    OnRun() {
        var _a;
        //this.StartSafeMode()
        if (this.m_Colony_queen) {
            const behaviorless_creeps = new Array();
            for (let creep of this.m_Creeps) {
                let spawnning_creep = (_a = this.m_Colony_queen.spawning) === null || _a === void 0 ? void 0 : _a.name;
                if (creep.GetBehavior() === CreepBehaviorConsts_1.HAS_NO_BEHAVIOR && creep.GetName() !== spawnning_creep) {
                    behaviorless_creeps.push(creep);
                }
                this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName());
                const pos = creep.GetPos();
                if (pos) {
                    const room = Game.rooms[this.m_Room.GetName()];
                    const terrain = room.getTerrain().get(pos.x, pos.y);
                    if (terrain === TERRAIN_MASK_SWAMP) {
                        room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
                    }
                }
            }
            for (let creep of behaviorless_creeps) {
                this.CreateStack();
                creep.SetBehavior(this.UpdateData());
            }
            const harvester_count = this.m_Type_tracker.GetTypeCount(CreepBehaviorConsts_1.HARVEST_BEHAVIOR);
            const max = this.m_Type_queue.GetMax(CreepBehaviorConsts_1.HARVEST_BEHAVIOR);
            this.CreateStack();
            if (max !== -1 && harvester_count < max) {
                this.ConvertToHarvester();
            }
            if (this.m_Creep_types.Size() > 0) {
                this.SpawnColonyMember();
            }
        }
    }
    OnSave() {
        HardDrive_1.HardDrive.Write(this.m_Room.GetName(), this.m_Creeps_list);
    }
    RemoveFromMemory(name) {
        const creep_names = this.m_Creeps_list[this.m_Data_key];
        const index = creep_names.indexOf(name);
        if (index > -1) {
            creep_names.splice(index, 1);
        }
    }
}
exports.Colony = Colony;
