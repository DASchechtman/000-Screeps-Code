import { sign } from "crypto";
import { Colony } from "../Colony/Colony";
import { COLONY_TYPE, CREEP_TYPE } from "../Consts";
import { HardDrive, JsonObj } from "../Disk/HardDrive";
import { EventManager } from "../Events/EventManager";
import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { Filter, Signal, SignalManager } from "../Signals/SignalManager";
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
    private m_Cur_type: number
    private m_Room: RoomWrapper
    private m_Creep: Creep | undefined

    constructor(name: string, room: RoomWrapper) {
        super(name, CREEP_TYPE)
        this.m_Creep_name = name;
        CreepWrapper.behavior_types = new Map()
        this.m_Behavior = null
        this.m_Room = room
        this.m_Creep = Game.creeps[name]
        this.m_Cur_type = -1
    }

    private LoadTypes(): void {
        if (CreepWrapper.behavior_types.size === 0) {
            CreepWrapper.behavior_types.set(HARVEST_TYPE, new HarvestBehavior())
            CreepWrapper.behavior_types.set(BUILDER_TYPE, new BuildBehavior())
            CreepWrapper.behavior_types.set(DEFENDER_TYPE, new DefendBehavior())
            CreepWrapper.behavior_types.set(UPGRADER_TYPE, new UpgradeBehavior())
        }
    }

    private SendRemoveNameSignal() {

        const filter: Filter = (sender, other): boolean => {
            let is_right = false
            const creeper = signal.from as CreepWrapper
            const type = other.SignalRecieverType()
            const id = other.SignalRecieverID()

            if (type === COLONY_TYPE && id === creeper.GetRoomName()) {
                is_right = true
            }
            return is_right
        }

        let task = this.m_Behavior?.SignalTask()

        if (!task) {
            console.log("remove name method")
            task = (sender, reciever): boolean => {
                const creep = sender.from as CreepWrapper
                (reciever as Colony).RemoveFromMemory(creep.GetName())
                return true
            }
        }

        const signal: Signal = {
            from: this,
            data: this.m_Room.GetName(),
            method: task
        }

        SignalManager.Inst().SendSignal(signal, filter)
    }

    OnLoad(): void {
        this.LoadTypes()
        if (this.m_Creep) {
            const data = HardDrive.Read(this.m_Creep.name)
            const behavior = data.type
            if (typeof behavior === 'number') {
                this.m_Cur_type = behavior as number
                this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type)!!
            }
        }
        else {
            const data = HardDrive.Read(this.m_Creep_name)
            const behavior = data.type as number
            if (behavior) {
                this.m_Behavior = CreepWrapper.behavior_types.get(behavior)!!
            }

        }
    }

    OnRun(): void {
        if (this.m_Creep && this.m_Behavior) {
            this.m_Behavior.Load(this.m_Creep)
            this.m_Behavior.Behavior(this.m_Creep, this.m_Room)
            this.m_Behavior.Save(this.m_Creep)
        }
        else {
            HardDrive.Erase(this.m_Creep_name)
            this.SendRemoveNameSignal()
        }
    }

    OnSave(): void {
        if (this.m_Creep) {
            const data = HardDrive.Read(this.m_Creep_name)
            data.type = this.m_Cur_type
            HardDrive.Write(this.m_Creep_name, data)
        }

    }

    OnInvasion(): void {
        this.m_Behavior = CreepWrapper.behavior_types.get(DEFENDER_TYPE)!!
    }

    SetBehavior(new_type: number) {
        this.LoadTypes()
        if (CreepWrapper.behavior_types.has(new_type)) {
            this.m_Cur_type = new_type
            this.m_Behavior = CreepWrapper.behavior_types.get(this.m_Cur_type)!!
        }
    }

    GetBehavior(): number {
        return this.m_Cur_type
    }

    GetName(): string {
        return this.m_Creep_name;
    }

    GetRoomName(): string {
        return this.m_Room.GetName()
    }

    HasBehavior(): boolean {
        return Boolean(this.m_Behavior)
    }
}