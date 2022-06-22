"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeBehavior = void 0;
const CreepBehaviorConsts_1 = require("../../../consts/CreepBehaviorConsts");
const HardDrive_1 = require("../../../utils/harddrive/HardDrive");
const CreepBehavior_1 = require("./CreepBehavior");
class UpgradeBehavior extends CreepBehavior_1.CreepBehavior {
    constructor(wrapper) {
        super(wrapper);
        this.m_Data = {};
    }
    InitCreep(creep) { }
    InitTick(creep) {
        const behavior = HardDrive_1.HardDrive.ReadFolder(this.GetFolderPath(creep));
        const cur_state = Boolean(behavior === null || behavior === void 0 ? void 0 : behavior.can_upgrade);
        const id = String(behavior === null || behavior === void 0 ? void 0 : behavior.id);
        this.m_Data = {
            can_upgrade: this.UpdateWorkState(creep, cur_state),
            id: id
        };
    }
    RunTick(creep, room) {
        const controller = room.GetController();
        if (controller) {
            let source = Game.getObjectById(this.m_Data.id);
            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES);
                this.m_Data.id = String(source === null || source === void 0 ? void 0 : source.id);
            }
            if (this.m_Data.can_upgrade === true) {
                this.Upgrade(creep, controller);
            }
            else if (this.m_Data.can_upgrade === false && source) {
                this.Harvest(source, room);
            }
        }
    }
    FinishTick(creep) {
        HardDrive_1.HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data);
    }
    DestroyCreep(creep) { }
    Upgrade(creep, controller) {
        var _a;
        let dist = CreepBehaviorConsts_1.ActionDistance.UPGRADE;
        const shield = "\u{1F6E1}\uFE0F";
        const cross_swords = "\u2694\uFE0F";
        const msg = `${shield} This room is under the protection of the DAS colony. ${cross_swords}`;
        if (((_a = controller.sign) === null || _a === void 0 ? void 0 : _a.text) !== msg) {
            dist = CreepBehaviorConsts_1.ActionDistance.CHANGE_SIGN;
        }
        if (!this.MoveTo(dist, controller)) {
            if (dist === CreepBehaviorConsts_1.ActionDistance.CHANGE_SIGN) {
                creep.signController(controller, msg);
            }
            else {
                creep.upgradeController(controller);
            }
        }
    }
}
exports.UpgradeBehavior = UpgradeBehavior;
