"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeBehavior = void 0;
const HardDrive_1 = require("./HardDrive");
const CreepBehavior_1 = require("./CreepBehavior");
const CreepBehaviorConsts_1 = require("./CreepBehaviorConsts");
class UpgradeBehavior extends CreepBehavior_1.CreepBehavior {
    constructor() {
        super(...arguments);
        this.m_Data = {};
    }
    Load(creep) {
        const behavior = this.GetBehavior(creep);
        const cur_state = Boolean(behavior === null || behavior === void 0 ? void 0 : behavior.can_upgrade);
        this.m_Data = {
            can_upgrade: this.UpdateWorkState(creep, cur_state)
        };
    }
    Run(creep, room) {
        const controller = room.GetController();
        if (controller) {
            const source = room.GetSources()[0];
            if (this.m_Data.can_upgrade === true) {
                this.Upgrade(creep, controller);
            }
            else if (this.m_Data.can_upgrade === false) {
                this.Harvest(creep, source);
            }
        }
    }
    Save(creep) {
        const data = HardDrive_1.HardDrive.Read(creep.name);
        data.behavior = this.m_Data;
        HardDrive_1.HardDrive.Write(creep.name, data);
    }
    Upgrade(creep, controller) {
        var _a;
        let dist = CreepBehaviorConsts_1.UPGRADE_DISTANCE;
        let change_sign = false;
        const shield = "\u{1F6E1}\uFE0F";
        const cross_swords = "\u2694\uFE0F";
        const msg = `${shield} This room is under the protection of the DAS colony. ${cross_swords}`;
        if (((_a = controller.sign) === null || _a === void 0 ? void 0 : _a.text) !== msg) {
            dist = CreepBehaviorConsts_1.CHANGE_SIGN_DISTANCE;
            change_sign = true;
        }
        if (!this.MoveTo(dist, creep, controller)) {
            if (change_sign) {
                creep.signController(controller, msg);
            }
            else {
                creep.upgradeController(controller);
            }
        }
    }
}
exports.UpgradeBehavior = UpgradeBehavior;
