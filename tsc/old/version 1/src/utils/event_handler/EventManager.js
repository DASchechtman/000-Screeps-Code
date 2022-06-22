"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
class EventManager {
    constructor() {
        this.events_list = [];
    }
    static GetInst() {
        if (this.inst === null) {
            this.inst = new EventManager();
        }
        return this.inst;
    }
    RunEvent(event) {
        var _a, _b;
        console.log((_a = this.events_list[event]) === null || _a === void 0 ? void 0 : _a.length);
        (_b = this.events_list[event]) === null || _b === void 0 ? void 0 : _b.forEach((call_back) => {
            call_back();
        });
    }
    AddEventMethod(event, call_back) {
        var _a;
        if (!this.events_list[event]) {
            this.events_list[event] = [];
        }
        (_a = this.events_list[event]) === null || _a === void 0 ? void 0 : _a.push(call_back);
    }
    RemoveEventMethod(event, call_back) {
        var _a;
        if (this.events_list[event]) {
            const index = this.events_list[event].indexOf(call_back);
            if (index !== -1) {
                (_a = this.events_list[event]) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
            }
        }
    }
}
exports.EventManager = EventManager;
EventManager.inst = null;
