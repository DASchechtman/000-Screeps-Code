"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildBehavior = void 0;
const CreepBehaviorConsts_1 = require("./CreepBehaviorConsts");
const HardDrive_1 = require("./HardDrive");
const CreepBehavior_1 = require("./CreepBehavior");
class BuildBehavior extends CreepBehavior_1.CreepBehavior {
    constructor() {
        super(...arguments);
        this.m_Data = {};
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
        const sites = room.GetConstructionSites();
        if (sites.length > 0) {
            const build_site = sites[0];
            let source = Game.getObjectById(this.m_Data.id);
            if (!source) {
                source = build_site.pos.findClosestByPath(FIND_SOURCES);
            }
            if (this.m_Data.can_build) {
                this.Build(creep, build_site);
            }
            else if (source) {
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
}
exports.BuildBehavior = BuildBehavior;
