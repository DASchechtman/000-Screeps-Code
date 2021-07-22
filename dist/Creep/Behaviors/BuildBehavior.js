"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../Constants/CreepBehaviorConsts");
const PriorityQueue_1 = require("../../DataStructures/PriorityQueue");
const HardDrive_1 = require("../../Disk/HardDrive");
const CreepBehavior_1 = require("./CreepBehavior");
class BuildBehavior extends CreepBehavior_1.CreepBehavior {
    constructor() {
        super();
        this.m_Data = {};
        this.m_Site_queue = new PriorityQueue_1.PriorityQueue((el) => {
            let sort_val = Number.MAX_SAFE_INTEGER / 2;
            if (el.structureType === STRUCTURE_WALL || el.structureType === STRUCTURE_RAMPART) {
                sort_val = 0;
            }
            return sort_val + this.m_Site_queue.Size();
        });
    }
    Load(creep) {
        const behavior = this.GetBehavior(creep);
        const cur_state = Boolean(behavior === null || behavior === void 0 ? void 0 : behavior.can_build);
        const source_id = String(behavior === null || behavior === void 0 ? void 0 : behavior.id);
        this.m_Data = {
            can_build: this.UpdateWorkState(creep, cur_state),
            id: source_id
        };
    }
    Run(creep, room) {
        if (this.m_Site_queue.Size() === 0) {
            this.FillQueue(room);
        }
        const sites = this.m_Site_queue.Peek();
        if (sites) {
            const build_site = sites;
            let source = Game.getObjectById(this.m_Data.id);
            if (!source) {
                source = build_site.pos.findClosestByPath(FIND_SOURCES);
            }
            if (this.m_Data.can_build) {
                this.Build(creep, build_site);
            }
            else {
                this.m_Data.id = source.id;
                this.Harvest(creep, source);
            }
        }
        else {
            this.ClearDiskData(creep);
            creep.suicide();
        }
    }
    Save(creep) {
        const data = HardDrive_1.HardDrive.Read(creep.name);
        data.behavior = this.m_Data;
        HardDrive_1.HardDrive.Write(creep.name, data);
    }
    Build(creep, build_site) {
        if (!this.MoveTo(CreepBehaviorConsts_1.BUILD_DISTANCE, creep, build_site)) {
            creep.build(build_site);
        }
    }
    FillQueue(room) {
        const sites = room.GetConstructionSites();
        for (let s of sites) {
            this.m_Site_queue.Push(s);
        }
    }
}
exports.BuildBehavior = BuildBehavior;
