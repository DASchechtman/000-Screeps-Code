import { Behavior } from "../consts/CreepBehaviorConsts";
import { GameEntityTypes } from "../consts/GameConstants";
import { SignalMessage } from "../types/Interfaces";
import { HardDrive } from "../utils/harddrive/HardDrive";
import { ColonyMember } from "./ColonyMember";
import { BuildBehavior } from "./CreepBehavior/BuildBehavior";
import { CreepBehavior } from "./CreepBehavior/CreepBehavior";
import { DefendBehavior } from "./CreepBehavior/DefendBehavior";
import { HarvestBehavior } from "./CreepBehavior/HarvestBehavior";
import { RepairBehavior } from "./CreepBehavior/RepairBehavior";
import { UpgradeBehavior } from "./CreepBehavior/UpgradeBehavior";
import { RoomWrapper } from "./room/RoomWrapper";

export class CreepWrapper extends ColonyMember {
    private behaviors = new Map<Behavior, CreepBehavior>()

    private m_Name: string
    private m_Behavior_type: Behavior = Behavior.NONE
    private m_Behavior: CreepBehavior | undefined = undefined
    private type_file_path: string
    private m_Base_path: string
    private m_Creep: Creep | undefined = undefined
    private m_Not_run_yet = true

    constructor(creep_name: string) {

        super(GameEntityTypes.CREEP, creep_name)

        this.m_Name = creep_name
        const creep = this.GetCreep()
        if (creep) {
            this.m_Base_path = HardDrive.Join(creep.room.name, this.m_Name)
            this.type_file_path = HardDrive.Join(this.m_Base_path, "creep-type", "type")
        }
        else {
            this.type_file_path = ""
            this.m_Base_path = ""
        }

        if (this.behaviors.size === 0) {
            this.behaviors.set(Behavior.HARVEST, new HarvestBehavior(this))
            this.behaviors.set(Behavior.UPGRADER, new UpgradeBehavior(this))
            this.behaviors.set(Behavior.DEFENDER, new DefendBehavior(this))
            this.behaviors.set(Behavior.BUILDER, new BuildBehavior(this))
            this.behaviors.set(Behavior.REPAIR, new RepairBehavior(this))
        }
    }

    public GetCreep(): Creep | undefined {
        if (!this.m_Creep) {
            this.m_Creep = Game.creeps[this.m_Name]
        }
        return this.m_Creep
    }

    public OnTickStart(): void {
        const type = HardDrive.ReadFile(this.type_file_path)
        if (typeof type === 'number') {
            this.m_Behavior_type = type
            this.m_Behavior = this.behaviors.get(this.m_Behavior_type)
        }

    }

    public OnTickRun(): void {
        const creep = this.GetCreep()
        if (creep && this.m_Behavior) {
            const room = new RoomWrapper(creep.room.name)

            if (this.m_Not_run_yet) {
                this.m_Behavior.InitCreep(creep)
                this.m_Not_run_yet = false
            }

            this.m_Behavior.InitTick(creep)
            this.m_Behavior.RunTick(creep, room)
            this.m_Behavior.FinishTick(creep)
        }
        else {
            this.m_Behavior?.DestroyCreep(null)
            HardDrive.DeleteFolder(this.m_Base_path)
            this.m_Signal = {
                data: this.m_Name,
                sender: this,
                receiver_type: GameEntityTypes.COLONY
            }
        }
    }

    public OnTickEnd(): void {
        if (this.GetCreep()) {
            HardDrive.WriteFile(this.type_file_path, this.m_Behavior_type)
        }
    }

    public OnDestroy(): void {
        this.m_Creep = undefined
    }

    public ReceiveSignal(signal: SignalMessage): boolean {
        let was_processed = false
        
        if (this.m_Behavior) {
            was_processed = this.m_Behavior.ReceiveSignal(signal)
            this.m_Signal = {
                data: this.GetID(),
                sender: this,
                reciever_name: signal.sender.GetID()
            }
        }

        return was_processed
    }

    public GetBehavior(): number {
        return this.m_Behavior_type
    }

    public SetBehavior(new_behavior: Behavior): void {
        const creep = this.GetCreep()

        if (creep) {
            this.m_Not_run_yet = true
            this.m_Behavior_type = new_behavior
            this.m_Behavior = this.behaviors.get(new_behavior)!!
        }
    }

    public GetPath(): string {
        return this.m_Base_path
    }
}