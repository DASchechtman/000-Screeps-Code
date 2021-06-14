"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventObserver = void 0;
var EventManager_1 = require("./EventManager");
var EventObserver = /** @class */ (function () {
    function EventObserver() {
        EventManager_1.EventManager.Inst().Add(this);
    }
    EventObserver.prototype.OnSave = function () { };
    EventObserver.prototype.OnLoad = function () { };
    EventObserver.prototype.OnRun = function () { };
    EventObserver.prototype.OnCreepDeath = function () { };
    EventObserver.prototype.OnCreepCreate = function () { };
    return EventObserver;
}());
exports.EventObserver = EventObserver;
