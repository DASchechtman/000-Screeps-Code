import { GameEntityTypes } from "../consts/GameConstants";
import { SignalMessage } from "../types/Interfaces";
import { JsonType } from "../utils/harddrive/JsonTreeNode";

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

    public GetType(): GameEntityTypes {
        return this.m_Type
    }

    public GetID(): string {
        return this.m_Id
    }

    public GetSignal(): SignalMessage | null {
        return this.m_Signal
    }

    public SetSignal(signal: SignalMessage | null): void {
        this.m_Signal = signal
    }

    public ReceiveSignal(signal: SignalMessage): boolean {
        return false
    }

    public GetDataToRecord(): JsonType {
        return null
    }
}