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
    private static behaviors = new Map<Behavior, CreepBehavior>()

    private m_Name: string
    private m_Behavior_type: Behavior = Behavior.NONE
    private m_Behavior: CreepBehavior | undefined = undefined
    private type_file_path: string
    private m_Creep: Creep | undefined = undefined

    constructor(creep_name: string) {

        super(GameEntityTypes.CREEP, creep_name)

        this.m_Name = creep_name
        if (this.GetCreep()) {
            this.type_file_path = HardDrive.Join(this.m_Name, "creep-type", "type")
        }
        else {
            this.type_file_path = ""
        }

        if (CreepWrapper.behaviors.size === 0) {
            CreepWrapper.behaviors.set(Behavior.HARVEST, new HarvestBehavior())
            CreepWrapper.behaviors.set(Behavior.UPGRADER, new UpgradeBehavior())
            CreepWrapper.behaviors.set(Behavior.DEFENDER, new DefendBehavior())
            CreepWrapper.behaviors.set(Behavior.BUILDER, new BuildBehavior())
            CreepWrapper.behaviors.set(Behavior.REPAIR, new RepairBehavior())
        }
    }

    private GetCreep(): Creep | undefined {
        if (!this.m_Creep) {
            this.m_Creep = Game.creeps[this.m_Name]
        }
        return this.m_Creep
    }

    public OnLoad(): void {
        const type = HardDrive.ReadFile(this.type_file_path)
        if (typeof type === 'number') {
            this.m_Behavior_type = type
            this.m_Behavior = CreepWrapper.behaviors.get(this.m_Behavior_type)
        }

    }

    public OnRun(): void {
        const creep = this.GetCreep()
        if (creep && this.m_Behavior) {
            const room = new RoomWrapper(creep.room.name)
            this.m_Behavior.Load(creep)
            this.m_Behavior.Run(creep, room)
            this.m_Behavior.Save(creep)
            this.m_Behavior.Destroy(creep)
        }
        else {
            //console.log(`error: creep cant run. Internal Creep: ${this.m_Creep}, Internal behavior: ${this.m_Behavior}`)
            HardDrive.DeleteFolder(this.m_Name)
            this.m_Signal = {
                data: this.m_Name,
                sender: this,
                receiver_type: GameEntityTypes.COLONY
            }
        }
    }

    public OnSave(): void {
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
            this.m_Behavior_type = new_behavior
            this.m_Behavior = CreepWrapper.behaviors.get(new_behavior)!!
        }
    }
}