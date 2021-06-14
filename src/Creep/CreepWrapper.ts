import { EventManager } from "../Events/EventManager";
import { GameObject } from "../Events/GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { BuildBehavior } from "./BuildBehavior";
import { CreepBehavior } from "./CreepBehavior";
import { BUILDER_TYPE, DEFENDER_TYPE, HARVEST_TYPE, UPGRADER_TYPE } from "./CreepTypes";
import { DefendBehavior } from "./DefendBehavior";
import { HarvestBehavior } from "./HarvestBehavior";
import { UpgradeBehavior } from "./UpgradeBehavior";

export class CreepWrapper extends GameObject {
    private static behavior_types: Map<number, CreepBehavior>

    private m_Creep_name: string
    private m_Behavior: CreepBehavior | null
    private m_Cur_type = HARVEST_TYPE
    private m_Room: RoomWrapper
    private m_Creep: Creep | undefined

    constructor(name: string, room: RoomWrapper) {
        super()
        this.m_Creep_name = name;
        CreepWrapper.behavior_types = new Map()
        this.m_Behavior = null
        this.m_Room = room
        this.m_Creep = Game.creeps[name]
    }

    private LoadTypes(): void {
        if (CreepWrapper.behavior_types.size === 0) {
            CreepWrapper.behavior_types.set(HARVEST_TYPE, new HarvestBehavior())
            CreepWrapper.behavior_types.set(BUILDER_TYPE, new BuildBehavior())
            CreepWrapper.behavior_types.set(DEFENDER_TYPE, new DefendBehavior())
            CreepWrapper.behavior_types.set(UPGRADER_TYPE, new UpgradeBehavior())
        }
    }

    OnLoad(): void {
        this.LoadTypes()
        this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type)!!
    }

    OnRun(): void {
        this.Act()
    }

    OnSave(): void { }

    SetType(new_type: number) {
        this.LoadTypes()
        if (CreepWrapper.behavior_types.has(new_type)) {
            this.m_Cur_type = new_type
            this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type)!!
        }
    }

    Act(): void {
        this.m_Creep = Game.creeps[this.m_Creep_name]

        if (this.m_Creep && this.m_Behavior) {
            this.m_Behavior.Load(this.m_Creep)
            this.m_Behavior.Behavior(this.m_Creep, this.m_Room)
            this.m_Behavior.Save(this.m_Creep)

            if (this.m_Creep.ticksToLive === 1) {
                this.m_Behavior.ClearDiskData(this.m_Creep)
            }
        }
    }

    GetName(): string {
        return this.m_Creep_name;
    }

    HasBehavior(): boolean {
        return Boolean(this.m_Behavior)
    }
}