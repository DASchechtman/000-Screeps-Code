"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const GameConstants_1 = require("./consts/GameConstants");
const Prototypes_1 = require("./Prototypes/Prototypes");
const Colony_1 = require("./core/Colony");
const HardDrive_1 = require("./utils/harddrive/HardDrive");
Prototypes_1.ExtendProperties();
const colonies = [];
for (let name in Game.rooms) {
    const room = Game.rooms[name];
    const controller = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_CONTROLLER } });
    const is_owned = ((_b = (_a = controller[0]) === null || _a === void 0 ? void 0 : _a.owner) === null || _b === void 0 ? void 0 : _b.username) === GameConstants_1.COLONY_OWNER;
    if (controller.length > 0 && is_owned) {
        const colony = new Colony_1.Colony(name);
        colony.OnInit();
        colonies.push(colony);
    }
}
module.exports.loop = () => {
    let end = 0;
    HardDrive_1.HardDrive.LoadData();
    for (let colony of colonies) {
        const start = Game.cpu.getUsed();
        colony.OnTickStart();
        colony.OnTickRun();
        colony.OnTickEnd();
        colony.OnDestroy();
        if (colony.GetID() !== GameConstants_1.DEBUG_ROOM_NAME) {
            end += Game.cpu.getUsed() - start;
        }
    }
    HardDrive_1.HardDrive.CommitChanges();
    if (end > 0) {
        console.log(`cpu used: ${end}`);
    }
};
