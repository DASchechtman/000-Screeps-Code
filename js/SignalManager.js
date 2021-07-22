"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalManager = void 0;
const Stack_1 = require("./Stack");
class SignalManager {
    constructor() {
        this.members = new Map();
        this.cache = new Map();
        this.key_stack = new Stack_1.Stack();
        this.CACHE_THRESHOLD = 20;
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
        const member = {
            member: signal_entity,
            receive_count: 0
        };
        this.members.set(entity, member);
    }
    SendSignal(signal) {
        let found = false;
        for (let [key, val] of this.cache) {
            found = this.CheckEntry([key, val], signal, false);
            if (found) {
                break;
            }
        }
        for (let [key, val] of this.members) {
            if (found || this.CheckEntry([key, val], signal, true)) {
                break;
            }
        }
    }
    SentSignalCleared(entity) {
        var _a, _b;
        (_a = this.cache.get(entity)) === null || _a === void 0 ? void 0 : _a.member.signals.Pop();
        (_b = this.members.get(entity)) === null || _b === void 0 ? void 0 : _b.member.signals.Pop();
    }
    CheckEntry(entry, signal, should_cache) {
        let found_reciever = false;
        const key = entry[0];
        const value = entry[1];
        const cur_size = value.member.signals.Size();
        const max_size = value.member.max_signals;
        if (signal.filter(signal, key) && cur_size < max_size) {
            value.member.signals.Push(signal);
            const cur_signal = value.member.signals.Peek();
            if (cur_signal) {
                key.OnReceivedSignal(cur_signal);
            }
            found_reciever = true;
            value.receive_count++;
            if (value.receive_count >= this.CACHE_THRESHOLD && should_cache) {
                this.Cache(key);
            }
        }
        return found_reciever;
    }
    Cache(key) {
        if (this.members.has(key)) {
            const memeber = this.members.get(key);
            this.members.delete(key);
            this.cache.set(key, memeber);
        }
    }
}
exports.SignalManager = SignalManager;
SignalManager.inst = null;
