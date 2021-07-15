"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalManager = void 0;
const Stack_1 = require("./Stack");
class SignalManager {
    constructor() {
        this.members = new Map();
    }
    static Inst() {
        if (!SignalManager.inst) {
            SignalManager.inst = new SignalManager();
        }
        return SignalManager.inst;
    }
    Add(entity, max_accepted_signals) {
        const signal_entity = {
            reciever: entity,
            signals: new Stack_1.Stack(),
            max_signals: max_accepted_signals
        };
        this.members.set(entity, signal_entity);
    }
    SendSignal(signal) {
        const entries = Array.from(this.members.entries());
        for (let entry of entries) {
            const key = entry[0];
            const value = entry[1];
            const cur_size = value.signals.Size();
            const max_size = value.max_signals;
            if (signal.filter(signal, key) && cur_size < max_size) {
                value.signals.Push(signal);
                const cur_signal = value.signals.Peek();
                if (cur_signal) {
                    key.OnReceivedSignal(cur_signal);
                }
                break;
            }
        }
    }
    SentSignalCleared(entity) {
        var _a;
        (_a = this.members.get(entity)) === null || _a === void 0 ? void 0 : _a.signals.Pop();
    }
}
exports.SignalManager = SignalManager;
SignalManager.inst = null;
