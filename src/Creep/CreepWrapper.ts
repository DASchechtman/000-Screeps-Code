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
    private m_Is_alive: boolean
    private m_Behavior: CreepBehavior | null
    private m_Cur_type = HARVEST_TYPE
    private m_Room: RoomWrapper

    constructor(id: string, room: RoomWrapper) {
        super()
        this.m_Creep_name = id;
        CreepWrapper.behavior_types = new Map()
        this.m_Behavior = null
        this.m_Is_alive = true
        this.m_Room = room
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

    Act(): boolean {
        const creep = Game.creeps[this.m_Creep_name]

        if (creep && this.m_Behavior) {
            this.m_Behavior.Load(creep)
            this.m_Behavior.Behavior(creep, this.m_Room)
            this.m_Behavior.Save(creep)

            if (creep.ticksToLive === 1) {
                this.m_Behavior.Destroy(creep)
            }
        }
        else {
            this.m_Is_alive = false
        }

        return this.m_Is_alive
    }

    GetName(): string {
        return this.m_Creep_name;
    }

    HasBehavior(): boolean {
        return Boolean(this.m_Behavior)
    }

    IsAlive(): boolean {
        return this.m_Is_alive
    }
}