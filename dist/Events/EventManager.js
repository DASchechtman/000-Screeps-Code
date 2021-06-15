"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
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
                case EventManager.SAVE_EVENT: {
                    observer.OnSave();
                    break;
                }
                case EventManager.LOAD_EVENT: {
                    observer.OnLoad();
                    break;
                }
                case EventManager.RUN_EVENT: {
                    observer.OnRun();
                    break;
                }
                case EventManager.INVASION_EVENT: {
                    observer.OnInvasion();
                    break;
                }
            }
            i++;
        }
    };
    EventManager.SAVE_EVENT = 0;
    EventManager.LOAD_EVENT = 1;
    EventManager.RUN_EVENT = 2;
    EventManager.CREEP_DEATH_EVENT = 3;
    EventManager.CREEP_CREATE_EVENT = 4;
    EventManager.INVASION_EVENT = 5;
    EventManager.instance = null;
    return EventManager;
}());
exports.EventManager = EventManager;
