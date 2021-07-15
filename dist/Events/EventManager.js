"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
const EventConsts_1 = require("../Constants/EventConsts");
class EventManager {
    constructor() {
        this.observers_list = new Array();
    }
    static Inst() {
        if (!this.instance) {
            this.instance = new EventManager();
        }
        return this.instance;
    }
    Add(observer) {
        this.observers_list.push(observer);
    }
    Remove(observer) {
        const index = this.observers_list.indexOf(observer);
        delete this.observers_list[index];
    }
    Notify(event_type) {
        let i = 0;
        while (i < this.observers_list.length) {
            const observer = this.observers_list[i];
            switch (event_type) {
                case EventConsts_1.SAVE_EVENT: {
                    observer.OnSave();
                    break;
                }
                case EventConsts_1.LOAD_EVENT: {
                    observer.OnLoad();
                    break;
                }
                case EventConsts_1.RUN_EVENT: {
                    observer.OnRun();
                    break;
                }
                case EventConsts_1.INVASION_EVENT: {
                    observer.OnInvasion();
                    break;
                }
                case EventConsts_1.REPAIR_EVENT: {
                    observer.OnRepair();
                    break;
                }
            }
            i++;
        }
    }
}
exports.EventManager = EventManager;
EventManager.instance = null;
