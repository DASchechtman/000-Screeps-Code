import { Stack } from "../DataStructures/Stack";
import { GameObject } from "../GameObject";

export type Filter = (sender: Signal, other: GameObject) => boolean
export type Method = Filter

export interface Signal {
    from: GameObject,
    data: any,
    method: Method
}

export interface SignalReciever {
    reciever: GameObject
    signals: Stack<Signal>
}

export class SignalManager {
    private static inst: SignalManager | null = null

    private members: Map<GameObject, SignalReciever>

    private constructor() {
        this.members = new Map()
    }

    static Inst(): SignalManager {
        if (!SignalManager.inst) {
            SignalManager.inst = new SignalManager()
        }
        return SignalManager.inst
    }

    Add(entity: GameObject): void {
        const signal_entity: SignalReciever = {
            reciever: entity,
            signals: new Stack()
        }
        this.members.set(entity, signal_entity)
    }

    SendSignal(signal: Signal, filter: Filter): void {
        const entries = Array.from(this.members.entries())
        for (let entry of entries) {
            const key = entry[0]
            const value = entry[1]
            if (filter(signal, key)) {
                value.signals.Push(signal)
                const cur_signal = value.signals.Peek()
                if (cur_signal) {
                    key.OnReceivedSignal(cur_signal)
                }
                break
            }
        }
    }

    SentSignalCleared(entity: GameObject): void {
        this.members.get(entity)?.signals.Pop()
    }

}