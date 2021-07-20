import { COLONY_TYPE, CREEP_TYPE } from "../Constants/GameObjectConsts";
import { CreepBuilder } from "../Creep/CreepBuilder";
import { DEFENDER_BEHAVIOR, HARVEST_BEHAVIOR, REPAIR_BEHAVIOR } from "../Constants/CreepBehaviorConsts";
import { CreepWrapper } from "../Creep/CreepWrapper";
import { Stack } from "../DataStructures/Stack";
import { HardDrive } from "../Disk/HardDrive";
import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { SignalManager } from "../Signals/SignalManager";
import { CreepTypeQueue } from "./CreepTypeQueue";
import { CreepTypeTracker } from "./CreepTypeTracker";
import { JsonObj, Signal } from "../CompilerTyping/Interfaces";
import { send } from "process";
import { StructureWrapper } from "../Structure/StructureWrapper";
import { TimedStructureWrapper } from "../Structure/TimedStructureWrapper";
import { BehaviorStructureWrapper } from "../Structure/BehaviorStructureWrapper";
import { CpuTimer } from "../CpuTimer";

export class Colony extends GameObject {

    private m_Room: RoomWrapper
    private m_Colony_queen: StructureSpawn | null;
    private m_Creeps_count: number;
    private m_Creep_types: Stack<number>
    private m_Creeps: Array<CreepWrapper>
    private m_Creep_cap: number
    private m_Creeps_list: JsonObj
    private m_Data_key: string
    private m_Type_tracker: CreepTypeTracker
    private m_Type_queue: CreepTypeQueue

    constructor(room_name: string) {
        super(room_name, COLONY_TYPE)
        this.m_Room = new RoomWrapper(room_name)
        this.m_Colony_queen = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        this.m_Creeps_count = 0
        this.m_Creep_cap = 10
        this.m_Creep_types = new Stack()
        this.m_Creeps_list = {}
        this.m_Data_key = "creeps"
        this.m_Creeps = new Array()
        this.m_Type_tracker = new CreepTypeTracker()
        this.m_Type_queue = new CreepTypeQueue(this.m_Room)
    }

    private GetCreepNames(): Array<string> {
        const data = HardDrive.Read(this.m_Room.GetName())
        if (data[this.m_Data_key]) {
            this.m_Creeps_list[this.m_Data_key] = data[this.m_Data_key]
        }
        else if (!this.m_Creeps_list[this.m_Data_key]) {
            this.m_Creeps_list[this.m_Data_key] = new Array<string>()
        }

        return this.m_Creeps_list[this.m_Data_key] as Array<string>
    }

    private SpawnCreep(type: number, name: string): boolean {
        let created = false

        if (!this.m_Colony_queen?.spawning) {

            const energy_capactiy = this.m_Room.GetEnergyCapacity()
            const energy_stored = this.m_Room.GetEnergyStored()
            const creep_array = this.m_Creeps_list[this.m_Data_key] as Array<string>

            let body: Array<BodyPartConstant>

            if (type === DEFENDER_BEHAVIOR && creep_array?.length > 0) {
                body = CreepBuilder.BuildScalableDefender(energy_capactiy)
            }
            else if (creep_array?.length > 0) {
                body = CreepBuilder.BuildScalableWorker(energy_capactiy)
            }
            else {
                body = CreepBuilder.WORKER_BODY
            }

            const body_energy_cost = CreepBuilder.GetBodyCost(body)

            if (body_energy_cost <= energy_stored) {
                this.m_Colony_queen?.spawnCreep(body, name)
                created = true
            }
        }


        return created
    }

    private CreateCreep(name: string, type: number): CreepWrapper {
        const creep = new CreepWrapper(name, this.m_Room)
        creep.SetBehavior(type)
        return creep
    }

    private PushCreepAndNameToLists(creep: CreepWrapper): void {
        this.m_Creeps.push(creep)
        this.GetCreepNames().push(creep.GetName())
    }

    private UpdateData(): number | null {
        this.m_Creeps_count++
        const behavior = this.m_Creep_types.Pop()
        return behavior
    }

    private CreateStack(): void {
        this.m_Creep_types = this.m_Type_queue.CreateStack(this.m_Type_tracker)
    }

    private SpawnColonyMember(): void {
        const type = this.m_Creep_types.Peek()


        if (typeof type === 'number' && !this.m_Colony_queen?.spawning) {
            const name = `creep-${Date.now()}`
            const spawn_queued = this.SpawnCreep(type, name)

            if (spawn_queued) {
                const creep_wrap = this.CreateCreep(name, type)
                this.PushCreepAndNameToLists(creep_wrap)
                this.UpdateData()
                this.m_Type_tracker.Add(creep_wrap.GetBehavior(), creep_wrap.GetName())
            }
        }
    }

    private ConvertToHarvester(): void {
        const creep_levels = [
            CreepTypeTracker.LEVEL_THREE,
            CreepTypeTracker.LEVEL_TWO
        ]

        for (let level of creep_levels) {
            const count = this.m_Type_tracker.GetLevelCount(level)

            if (count > 0) {
                const names = this.m_Type_tracker.GetNamesByLevel(level)

                const signal: Signal = {
                    from: this,
                    data: {
                        obj_type: CREEP_TYPE,
                        creep_type: HARVEST_BEHAVIOR,
                        name: names[0]
                    },
                    filter: (sender, other): boolean => {
                        const is_creep = other.SignalRecieverType() === sender.data.obj_type
                        const same_name = other.SignalRecieverID() === sender.data.name
                        return is_creep && same_name
                    },
                    method: (sender, reciever): boolean => {
                        const creep = (reciever as CreepWrapper)
                        HardDrive.Erase(creep.GetName())
                        this.m_Type_tracker.Remove(creep.GetBehavior(), creep.GetName())
                        creep.SetBehavior(sender.data.creep_type as number)
                        this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName())
                        return true;
                    }
                }

                SignalManager.Inst().SendSignal(signal)

                break
            }
        }
    }

    private OnLoadCreeps(): void {
        const creep_names = this.GetCreepNames()
        this.CreateStack()

        for (var creep_name of creep_names) {
            if (creep_name !== this.m_Colony_queen?.spawning?.name) {
                const wrapper = new CreepWrapper(creep_name, this.m_Room)
                if (wrapper.GetBehavior() === -1) {
                    const new_behavior = this.UpdateData()
                    if (typeof new_behavior === 'number') {
                        wrapper.SetBehavior(new_behavior)
                        this.m_Type_tracker.Add(wrapper.GetBehavior(), wrapper.GetName())
                    }
                }
                wrapper.MakeReadyToRun()
                this.m_Creeps.push(wrapper)
                this.m_Creeps_count++
            }
        }
    }

    private OnLoadStructs(): void {
        const structs = this.m_Room.GetAllNonHostileStructs()

        for (let s of structs) {
            switch (s.structureType) {
                case STRUCTURE_ROAD:
                case STRUCTURE_RAMPART: {
                    new TimedStructureWrapper(s.id)
                    break
                }
                case STRUCTURE_TOWER:
                case STRUCTURE_LINK: {
                    new BehaviorStructureWrapper(s.id)
                    break
                }
                default: {
                    new StructureWrapper(s.id)
                    break
                }
            }
        }
    }

    OnLoad(): void {
        this.OnLoadCreeps()
        this.OnLoadStructs()
    }

    OnRun(): void {
        if (this.m_Colony_queen) {

            for (let creep of this.m_Creeps) {
                this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName())
                const pos = creep.GetPos()

                if (pos) {
                    const room = Game.rooms[this.m_Room.GetName()]

                    const terrain = room.getTerrain().get(pos.x, pos.y)

                    if (terrain === TERRAIN_MASK_SWAMP) {
                        room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD)
                    }
                }
            }

            const harvester_count = this.m_Type_tracker.GetTypeCount(HARVEST_BEHAVIOR)
            const max = this.m_Type_queue.GetMax(HARVEST_BEHAVIOR)

            if (max !== -1 && harvester_count < max) {
                this.ConvertToHarvester()
            }

            if (this.m_Creep_types.Size() > 0) {
                this.SpawnColonyMember()
            }
        }
    }

    OnSave(): void {
        HardDrive.Write(this.m_Room.GetName(), this.m_Creeps_list)
    }

    RemoveFromMemory(name: string): void {
        const creep_names = this.m_Creeps_list[this.m_Data_key] as Array<string>

        const index = creep_names.indexOf(name)

        if (index > -1) {
            creep_names.splice(index, 1)
        }
    }
}