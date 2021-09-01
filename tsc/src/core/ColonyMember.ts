import { GameEntityTypes } from "../consts/GameConstants";
import { SignalMessage } from "../types/Interfaces";

export abstract class ColonyMember {
    protected m_Type: GameEntityTypes
    protected m_Id: string
    protected m_Signal: SignalMessage | null

    constructor(type: GameEntityTypes, id: string) {
        this.m_Type = type
        this.m_Id = id
        this.m_Signal = null
    }

    abstract OnTickRun(): void
    abstract OnTickStart(): void
    abstract OnTickEnd(): void
    abstract OnDestroy(): void

    GetType(): GameEntityTypes {
        return this.m_Type
    }

    GetID(): string {
        return this.m_Id
    }

    GetSignal(): SignalMessage | null {
        return this.m_Signal
    }

    SetSignal(signal: SignalMessage | null): void {
        this.m_Signal = signal
    }

    ReceiveSignal(signal: SignalMessage): boolean {
        return false
    }
}