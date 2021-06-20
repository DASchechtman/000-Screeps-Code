"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardDrive = void 0;
var HardDrive = /** @class */ (function () {
    function HardDrive() {
    }
    HardDrive.Write = function (identifier, data) {
        var disk = JSON.parse(RawMemory.get());
        disk[identifier] = data;
        RawMemory.set(JSON.stringify(disk));
    };
    HardDrive.Read = function (identifier) {
        var data = JSON.parse(RawMemory.get())[identifier];
        if (!data) {
            data = {};
        }
        return data;
    };
    HardDrive.Erase = function (identifier) {
        var disk = JSON.parse(RawMemory.get());
        delete disk[identifier];
        RawMemory.set(JSON.stringify(disk));
    };
    return HardDrive;
}());
exports.HardDrive = HardDrive;
