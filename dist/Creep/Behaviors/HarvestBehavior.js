"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarvestBehavior = void 0;
const HardDrive_1 = require("../../Disk/HardDrive");
const CreepBehavior_1 = require("./CreepBehavior");
const CreepBehaviorConsts_1 = require("../../Constants/CreepBehaviorConsts");
class HarvestBehavior extends CreepBehavior_1.CreepBehavior {
    constructor() {
        super(...arguments);
        this.m_Data = {};
    }
    Load(creep) {
        const behavior = this.GetBehavior(creep);
        const cur_state = Boolean(behavior === null || behavior === void 0 ? void 0 : behavior.full);
        const free_container = String(behavior === null || behavior === void 0 ? void 0 : behavior.free_container);
        this.m_Data = {
            id: String(behavior === null || behavior === void 0 ? void 0 : behavior.id),
            full: this.UpdateWorkState(creep, cur_state),
            free_container: free_container
        };
    }
    Run(creep, room) {
        const source = this.GetEnergySource(creep);
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
                this.Harvest(creep, source);
            }
        }
    }
    Save(creep) {
        const save_data = HardDrive_1.HardDrive.Read(creep.name);
        save_data.behavior = this.m_Data;
        HardDrive_1.HardDrive.Write(creep.name, save_data);
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
        if (!this.MoveTo(CreepBehaviorConsts_1.TRANSFER_DISTANCE, creep, container)) {
            creep.transfer(container, RESOURCE_ENERGY);
        }
    }
    GetEnergySource(creep) {
        const source_id = this.m_Data.id;
        let source = Game.getObjectById(source_id);
        if (!source) {
            source = creep.pos.findClosestByPath(FIND_SOURCES);
        }
        return source;
    }
}
exports.HarvestBehavior = HarvestBehavior;
