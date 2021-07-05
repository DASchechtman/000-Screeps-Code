"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalManager = void 0;
var Stack_1 = require("../DataStructures/Stack");
var SignalManager = /** @class */ (function () {
    function SignalManager() {
        this.members = new Map();
    }
    SignalManager.Inst = function () {
        if (!SignalManager.inst) {
            SignalManager.inst = new SignalManager();
        }
        return SignalManager.inst;
    };
    SignalManager.prototype.Add = function (entity, max_accepted_signals) {
        var signal_entity = {
            reciever: entity,
            signals: new Stack_1.Stack(),
            max_signals: max_accepted_signals
        };
        this.members.set(entity, signal_entity);
    };
    SignalManager.prototype.SendSignal = function (signal) {
        var entries = Array.from(this.members.entries());
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            var key = entry[0];
            var value = entry[1];
            var cur_size = value.signals.Size();
            var max_size = value.max_signals;
            if (signal.filter(signal, key) && cur_size < max_size) {
                value.signals.Push(signal);
                var cur_signal = value.signals.Peek();
                if (cur_signal) {
                    key.OnReceivedSignal(cur_signal);
                }
                break;
            }
        }
    };
    SignalManager.prototype.SentSignalCleared = function (entity) {
        var _a;
        (_a = this.members.get(entity)) === null || _a === void 0 ? void 0 : _a.signals.Pop();
    };
    SignalManager.inst = null;
    return SignalManager;
}());
exports.SignalManager = SignalManager;
