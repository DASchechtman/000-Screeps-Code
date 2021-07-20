"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureBehavior = void 0;
const HardDrive_1 = require("../../Disk/HardDrive");
class StructureBehavior {
    GetId(struct) {
        return `${struct.id}${struct.room.name}`;
    }
    GetBehavior(struct) {
        return HardDrive_1.HardDrive.Read(this.GetId(struct)).behavior;
    }
    SaveBehavior(struct, data) {
        let save_data = this.GetBehavior(struct);
        save_data = data;
        HardDrive_1.HardDrive.Write(this.GetId(struct), save_data);
    }
}
exports.StructureBehavior = StructureBehavior;
