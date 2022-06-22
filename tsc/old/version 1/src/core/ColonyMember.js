"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColonyMember = void 0;
class ColonyMember {
    constructor(type, id) {
        this.m_Type = type;
        this.m_Id = id;
        this.m_Signal = null;
    }
    GetType() {
        return this.m_Type;
    }
    GetID() {
        return this.m_Id;
    }
    GetSignal() {
        return this.m_Signal;
    }
    SetSignal(signal) {
        this.m_Signal = signal;
    }
    ReceiveSignal(signal) {
        return false;
    }
}
exports.ColonyMember = ColonyMember;
