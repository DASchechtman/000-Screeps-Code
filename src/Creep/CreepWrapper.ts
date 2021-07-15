import { Colony } from "../Colony/Colony";
import { COLONY_TYPE, CREEP_TYPE } from "../Constants/GameObjectConsts";
import { HardDrive } from "../Disk/HardDrive";
import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { SignalManager } from "../Signals/SignalManager";
import { BuildBehavior } from "./Behaviors/BuildBehavior";
import { CreepBehavior } from "./Behaviors/CreepBehavior";
import { BUILDER_BEHAVIOR, DEFENDER_BEHAVIOR, HARVEST_BEHAVIOR, REPAIR_BEHAVIOR, UPGRADER_BEHAVIOR } from "../Constants/CreepBehaviorConsts";
import { DefendBehavior } from "./Behaviors/DefendBehavior";
import { HarvestBehavior } from "./Behaviors/HarvestBehavior";
import { UpgradeBehavior } from "./Behaviors/UpgradeBehavior";
import { Signal } from "../CompilerTyping/Interfaces";
import { RepairBehavior } from "./Behaviors/RepairBehavior";
import { CpuTimer } from "../CpuTimer";

/* 
Class meant to extend functionaliyt of creep, provides fuctions like
telling when creep dies
givig creep more flexible behavior
*/

export class CreepWrapper extends GameObject {
    private static behavior_types: Map<number, CreepBehavior>

    private m_Creep_name: string
    private m_Behavior: CreepBehavior | null
    private m_Cur_type: number
    private m_Room: RoomWrapper
    private m_Creep: Creep | undefined
    private m_Ready_to_run: boolean

    constructor(name: string, room: RoomWrapper) {
        super(name, CREEP_TYPE)
        this.m_Creep_name = name;
        CreepWrapper.behavior_types = new Map()
        this.m_Behavior = null
        this.m_Room = room
        this.m_Creep = Game.creeps[name]
        this.m_Cur_type = -1
        this.m_Ready_to_run = false
    }

    private LoadTypes(): void {
        if (CreepWrapper.behavior_types.size === 0) {
            CreepWrapper.behavior_types.set(HARVEST_BEHAVIOR, new HarvestBehavior())
            CreepWrapper.behavior_types.set(BUILDER_BEHAVIOR, new BuildBehavior())
            CreepWrapper.behavior_types.set(DEFENDER_BEHAVIOR, new DefendBehavior())
            CreepWrapper.behavior_types.set(UPGRADER_BEHAVIOR, new UpgradeBehavior())
            CreepWrapper.behavior_types.set(REPAIR_BEHAVIOR, new RepairBehavior())
        }
    }

    private SendRemoveNameSignal() {

        const signal: Signal = {
            from: this,
            data: { name: this.GetName() },
            filter: (sender, other): boolean => {
                let is_right = false
                const creeper = sender.from as CreepWrapper
                const type = other.SignalRecieverType()
                const id = other.SignalRecieverID()
    
                if (type === COLONY_TYPE && id === creeper.GetRoomName()) {
                    is_right = true
                }
                return is_right
            },
            method: (sender, reciever): boolean => {
                (reciever as Colony).RemoveFromMemory(sender.data.name as string)
                return true
            }
        }

        SignalManager.Inst().SendSignal(signal)
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
    }

    OnRun(): void {
        debugger
        if (this.m_Creep && this.m_Behavior && this.m_Ready_to_run) {
            this.m_Behavior.Load(this.m_Creep)
            this.m_Behavior.Run(this.m_Creep, this.m_Room)
            this.m_Behavior.Save(this.m_Creep)
        }
        else if(!this.m_Creep)  {
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
        this.m_Behavior = CreepWrapper.behavior_types.get(DEFENDER_BEHAVIOR)!!
    }

    OnSignal(signal: Signal): boolean {
        let ret = true
        if (signal.method) {
            ret = signal.method(signal, this)
        }
        else if (this.m_Behavior){
            ret = this.m_Behavior.Signal(signal, this)
        }
        return ret
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

    MakeReadyToRun(): void {
        this.m_Ready_to_run = true
    }

    GetPos(): RoomPosition | undefined{
        return this.m_Creep?.pos
    }
}