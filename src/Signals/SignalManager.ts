import { Stack } from "../DataStructures/Stack";
import { GameObject } from "../GameObject";
import { JsonObj, Signal, SignalMember, SignalReciever } from "../CompilerTyping/Interfaces";

export class SignalManager {
    private static inst: SignalManager | null = null

    private readonly CACHE_THRESHOLD: number

    private members: Map<GameObject, SignalMember>
    private cache: Map<GameObject, SignalMember>
    private key_stack: Stack<GameObject>

    private constructor() {
        this.members = new Map()
        this.cache = new Map()
        this.key_stack = new Stack()
        this.CACHE_THRESHOLD = 20
    }

    static Inst(): SignalManager {
        if (!SignalManager.inst) {
            SignalManager.inst = new SignalManager()
        }
        return SignalManager.inst
    }

    Add(entity: GameObject, max_accepted_signals: number): void {
        const signal_entity: SignalReciever = {
            reciever: entity,
            signals: new Stack(),
            max_signals: max_accepted_signals
        }
        const member: SignalMember = {
            member: signal_entity,
            receive_count: 0
        }
        this.members.set(entity, member)
    }

    SendSignal(signal: Signal): void {
        let found = false
        for (let [key, val] of this.cache) {
            found = this.CheckEntry([key, val], signal, false)
            if (found) {
                break
            }
        }


        for (let [key, val] of this.members) {
            if (found || this.CheckEntry([key, val], signal, true)) {
                break
            }
        }
    }

    SentSignalCleared(entity: GameObject): void {
        this.cache.get(entity)?.member.signals.Pop()
        this.members.get(entity)?.member.signals.Pop()
    }

    private CheckEntry(entry: [GameObject, SignalMember], signal: Signal, should_cache: boolean) {
        let found_reciever = false

        const key = entry[0]
        const value = entry[1]
        const cur_size = value.member.signals.Size()
        const max_size = value.member.max_signals

        if (signal.filter(signal, key) && cur_size < max_size) {
            value.member.signals.Push(signal)
            const cur_signal = value.member.signals.Peek()
            if (cur_signal) {
                key.OnReceivedSignal(cur_signal)
            }
            found_reciever = true
            value.receive_count++

            if (value.receive_count >= this.CACHE_THRESHOLD && should_cache) {
                this.Cache(key)
            }
        }

        return found_reciever
    }

    private Cache(key: GameObject) {
        if (this.members.has(key)) {
            const memeber = this.members.get(key)!!
            this.members.delete(key)
            this.cache.set(key, memeber)
        }
    }

}