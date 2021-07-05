"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
var EventConsts_1 = require("./EventConsts");
var EventManager = /** @class */ (function () {
    function EventManager() {
        this.observers_list = new Array();
    }
    EventManager.Inst = function () {
        if (!this.instance) {
            this.instance = new EventManager();
        }
        return this.instance;
    };
    EventManager.prototype.Add = function (observer) {
        this.observers_list.push(observer);
    };
    EventManager.prototype.Remove = function (observer) {
        var index = this.observers_list.indexOf(observer);
        delete this.observers_list[index];
    };
    EventManager.prototype.Notify = function (event_type) {
        var i = 0;
        while (i < this.observers_list.length) {
            var observer = this.observers_list[i];
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
    };
    EventManager.instance = null;
    return EventManager;
}());
exports.EventManager = EventManager;
