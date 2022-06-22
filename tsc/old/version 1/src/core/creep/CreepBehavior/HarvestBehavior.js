"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarvestBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../../consts/CreepBehaviorConsts");
const GameConstants_1 = require("../../../consts/GameConstants");
const EventManager_1 = require("../../../utils/event_handler/EventManager");
const HardDrive_1 = require("../../../utils/harddrive/HardDrive");
const SourceWrapper_1 = require("../../SourceWrapper");
const CreepBehavior_1 = require("./CreepBehavior");
class HarvestBehavior extends CreepBehavior_1.CreepBehavior {
    constructor(wrapper) {
        super(wrapper);
        this.m_Data = {};
    }
    InitCreep(creep) {
        // just a test of the event management system. Will remove it in
        // future development iterations
        EventManager_1.EventManager.GetInst().AddEventMethod(GameConstants_1.EventTypes.INVASION, this.OnInvasion);
    }
    InitTick(creep) {
        const behavior = HardDrive_1.HardDrive.ReadFolder(this.GetFolderPath(creep));
        const cur_state = Boolean(behavior === null || behavior === void 0 ? void 0 : behavior.full);
        const free_container = String(behavior === null || behavior === void 0 ? void 0 : behavior.free_container);
        this.m_Data = {
            id: String(behavior === null || behavior === void 0 ? void 0 : behavior.id),
            full: this.UpdateWorkState(creep, cur_state),
            free_container: free_container,
            "test-data": "testing testing 1, 2, 3"
        };
    }
    RunTick(creep, room) {
        const source = this.GetEnergySource(creep, room);
        if (source) {
            this.m_Data.id = source.id;
            if (this.m_Data.full) {
                let id = this.m_Data.free_container;
                let container = Game.getObjectById(id);
                if (!container || container.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                    this.SetFreeContainer(room);
                    id = this.m_Data.free_container;
                    container = Game.getObjectById(id);
                }
                this.DepositToContainer(creep, container);
            }
            else {
                this.Harvest(source, room);
            }
        }
    }
    FinishTick(creep) {
        HardDrive_1.HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data);
    }
    DestroyCreep(creep) {
        EventManager_1.EventManager.GetInst().RemoveEventMethod(GameConstants_1.EventTypes.INVASION, this.OnInvasion);
    }
    UpdateWorkState(creep, cur_state) {
        const resource_type = RESOURCE_ENERGY;
        const used_cap = creep.store.getUsedCapacity(resource_type);
        const free_cap = creep.store.getFreeCapacity(resource_type);
        let state = cur_state;
        if (used_cap === 0) {
            state = false;
        }
        else if (free_cap === 0) {
            state = true;
        }
        return state;
    }
    SetFreeContainer(room) {
        const spawn = room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
        const extensions = room.GetOwnedStructures(STRUCTURE_EXTENSION);
        const towers = room.GetOwnedStructures(STRUCTURE_TOWER);
        const free_containers = [spawn, ...extensions, ...towers];
        let container = spawn;
        for (let storage of free_containers) {
            if (storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                container = storage;
                break;
            }
        }
        this.m_Data.free_container = container.id;
    }
    DepositToContainer(creep, container) {
        if (!this.MoveTo(CreepBehaviorConsts_1.ActionDistance.TRANSFER, container)) {
            creep.transfer(container, RESOURCE_ENERGY);
        }
    }
    GetEnergySource(creep, room) {
        var _a;
        const source_id = (_a = this.m_Data) === null || _a === void 0 ? void 0 : _a.id;
        let source = Game.getObjectById(source_id ? source_id : "");
        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (source && !new SourceWrapper_1.SourceWrapper(source.id).HasFreeSpot()) {
                source = this.GetSource(creep, room);
            }
        }
        return source;
    }
    OnInvasion() {
        console.log("WE'RE UNDER ATTACK");
    }
}
exports.HarvestBehavior = HarvestBehavior;
