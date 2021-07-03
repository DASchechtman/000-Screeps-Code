import { EventManager } from "./Events/EventManager";
import { Signal } from "./CompilerTyping/Interfaces";
import { SignalManager } from "./Signals/SignalManager";

export abstract class GameObject {
    private m_Id: string
    private m_Type: number
    constructor(id: string, type: number) {
        this.m_Id = id
        this.m_Type = type
        EventManager.Inst().Add(this)
        SignalManager.Inst().Add(this)
    }

    // event manager functions below
    OnLoad(): void {}
    OnRun(): void {}
    OnSave(): void {}

    OnInvasion(): void {}

    // signal manager functions below
    SignalRecieverID(): string { return this.m_Id}
    SignalRecieverType(): number { return this.m_Type }

    OnSignal(signal: Signal): boolean {
        let ret = true
        if (signal.method) {
            ret = signal.method(signal, this)
        }
        return ret
    }

    OnReceivedSignal(signal: Signal): void {
        if (this.OnSignal(signal)) {
            SignalManager.Inst().SentSignalCleared(this)
        }
    }



}