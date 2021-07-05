"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObject = void 0;
var EventManager_1 = require("./Events/EventManager");
var SignalManager_1 = require("./Signals/SignalManager");
var GameObject = /** @class */ (function () {
    function GameObject(id, type, max_signals) {
        if (max_signals === void 0) { max_signals = 100; }
        this.m_Id = id;
        this.m_Type = type;
        EventManager_1.EventManager.Inst().Add(this);
        SignalManager_1.SignalManager.Inst().Add(this, max_signals);
    }
    // event manager functions below
    GameObject.prototype.OnLoad = function () { };
    GameObject.prototype.OnRun = function () { };
    GameObject.prototype.OnSave = function () { };
    GameObject.prototype.OnInvasion = function () { };
    GameObject.prototype.OnRepair = function () { };
    // signal manager functions below
    GameObject.prototype.SignalRecieverID = function () { return this.m_Id; };
    GameObject.prototype.SignalRecieverType = function () { return this.m_Type; };
    GameObject.prototype.OnSignal = function (signal) {
        var ret = true;
        if (signal.method) {
            ret = signal.method(signal, this);
        }
        return ret;
    };
    GameObject.prototype.OnReceivedSignal = function (signal) {
        if (this.OnSignal(signal)) {
            SignalManager_1.SignalManager.Inst().SentSignalCleared(this);
        }
    };
    return GameObject;
}());
exports.GameObject = GameObject;
