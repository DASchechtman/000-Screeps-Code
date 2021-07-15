"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardDrive = void 0;
class HardDrive {
    static LoadData() {
        if (HardDrive.disk_data === null) {
            try {
                HardDrive.disk_data = JSON.parse(RawMemory.get());
            }
            catch (_a) {
                HardDrive.disk_data = {};
            }
        }
        return HardDrive.disk_data;
    }
    static Write(identifier, data) {
        let disk = this.LoadData();
        disk[identifier] = data;
    }
    static Read(identifier) {
        let data = this.LoadData()[identifier];
        if (!data) {
            data = {};
        }
        return data;
    }
    static Erase(identifier) {
        let disk = this.LoadData();
        delete disk[identifier];
    }
    static CommitChanges() {
        if (HardDrive.disk_data !== null) {
            RawMemory.set(JSON.stringify(HardDrive.disk_data));
        }
    }
}
exports.HardDrive = HardDrive;
HardDrive.disk_data = null;
