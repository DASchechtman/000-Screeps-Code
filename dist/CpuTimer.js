"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuTimer = void 0;
class CpuTimer {
    static Start() {
        CpuTimer.start = Game.cpu.getUsed();
    }
    static End(msg = "") {
        const used_cpu = Game.cpu.getUsed();
        const dif = used_cpu - CpuTimer.start;
        if (msg.length === 0) {
            msg = `time taken in cpu units: ${dif}`;
        }
        else {
            msg = `${msg}: ${dif}`;
        }
        console.log(msg);
        console.log(`${used_cpu} cpu used out of ${Game.cpu.limit}`);
        CpuTimer.start = 0;
    }
}
exports.CpuTimer = CpuTimer;
CpuTimer.start = 0;
