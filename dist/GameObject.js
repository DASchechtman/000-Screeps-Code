"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObject = void 0;
const EventManager_1 = require("./Events/EventManager");
const SignalManager_1 = require("./Signals/SignalManager");
class GameObject {
    constructor(id, type, max_signals = 100) {
        this.m_Id = id;
        this.m_Type = type;
        EventManager_1.EventManager.Inst().Add(this);
        SignalManager_1.SignalManager.Inst().Add(this, max_signals);
    }
    // event manager functions below
    OnLoad() { }
    OnRun() { }
    OnSave() { }
    OnInvasion() { }
    OnRepair() { }
    // signal manager functions below
    SignalRecieverID() { return this.m_Id; }
    SignalRecieverType() { return this.m_Type; }
    OnSignal(signal) {
        let ret = true;
        if (signal.method) {
            ret = signal.method(signal, this);
        }
        return ret;
    }
    OnReceivedSignal(signal) {
        if (this.OnSignal(signal)) {
            SignalManager_1.SignalManager.Inst().SentSignalCleared(this);
        }
    }
}
exports.GameObject = GameObject;
