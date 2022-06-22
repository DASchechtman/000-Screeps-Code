"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../../consts/CreepBehaviorConsts");
const PriorityQueue_1 = require("../../../utils/datastructures/PriorityQueue");
const HardDrive_1 = require("../../../utils/harddrive/HardDrive");
const SourceWrapper_1 = require("../../SourceWrapper");
const CreepBehavior_1 = require("./CreepBehavior");
class BuildBehavior extends CreepBehavior_1.CreepBehavior {
    constructor(wrapper) {
        super(wrapper);
        this.m_Data = {};
        this.m_Site_queue = new PriorityQueue_1.PriorityQueue((el) => {
            let sort_val = 50000;
            const site = Game.getObjectById(el);
            if (site === null) {
                sort_val = Number.MAX_SAFE_INTEGER;
            }
            else if (site.structureType === STRUCTURE_EXTENSION) {
                sort_val = 25000;
            }
            else if (site.structureType === STRUCTURE_WALL || site.structureType === STRUCTURE_RAMPART) {
                sort_val = 0;
            }
            return sort_val + this.m_Site_queue.Size();
        });
    }
    InitCreep(creep) { }
    InitTick(creep) {
        const behavior = HardDrive_1.HardDrive.ReadFolder(this.GetFolderPath(creep));
        const cur_state = Boolean(behavior === null || behavior === void 0 ? void 0 : behavior.can_build);
        const source_id = String(behavior === null || behavior === void 0 ? void 0 : behavior.id);
        this.m_Data = {
            can_build: this.UpdateWorkState(creep, cur_state),
            id: source_id
        };
    }
    RunTick(creep, room) {
        this.m_Site_queue.PushArray(room.GetConstructionSites().map(s => s.id));
        let site = null;
        const size = this.m_Site_queue.Size();
        for (let i = 0; i < size; i++) {
            site = Game.getObjectById(this.m_Site_queue.Peek());
            if (site) {
                break;
            }
            else {
                this.m_Site_queue.Pop();
            }
        }
        if (site) {
            const build_site = site;
            let source = Game.getObjectById(this.m_Data.id);
            if (!source) {
                source = build_site.pos.findClosestByPath(FIND_SOURCES);
                if (!new SourceWrapper_1.SourceWrapper(source.id).HasFreeSpot()) {
                    source = this.GetSource(creep, room);
                }
            }
            if (this.m_Data.can_build) {
                this.Build(creep, build_site);
            }
            else {
                this.m_Data.id = source.id;
                this.Harvest(source, room);
            }
        }
        else {
            creep.suicide();
        }
    }
    FinishTick(creep) {
        HardDrive_1.HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data);
        this.m_Site_queue.Clear();
    }
    DestroyCreep(creep) { }
    Build(creep, build_site) {
        if (!this.MoveTo(CreepBehaviorConsts_1.ActionDistance.BUILD, build_site)) {
            if (creep.build(build_site) === ERR_INVALID_TARGET) {
                this.m_Site_queue.Pop();
            }
        }
    }
}
exports.BuildBehavior = BuildBehavior;
