import { EventManager } from "./Events/EventManager";
import { Signal, SignalManager } from "./Signals/SignalManager";

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
        return signal.method(signal, this);
    }

    OnReceivedSignal(signal: Signal): void {
        if (this.OnSignal(signal)) {
            SignalManager.Inst().SentSignalCleared(this)
        }
    }



}