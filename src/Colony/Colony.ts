import { COLONY_TYPE } from "../Consts";
import { CreepBuilder } from "../Creep/CreepBuilder";
import { DEFENDER_TYPE, HARVEST_TYPE } from "../Creep/CreepTypes";
import { CreepWrapper } from "../Creep/CreepWrapper";
import { Stack } from "../DataStructures/Stack";
import { HardDrive, JsonObj } from "../Disk/HardDrive";
import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { Filter, Method, Signal, SignalManager } from "../Signals/SignalManager";
import { CreepTypeQueue } from "./CreepTypeQueue";
import { CreepTypeTracker } from "./CreepTypeTracker";

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
        else if(!this.m_Creeps_list[this.m_Data_key]) {
            this.m_Creeps_list[this.m_Data_key] = new Array<string>()
        }

        return this.m_Creeps_list[this.m_Data_key] as Array<string>
    }

    private SpawnCreep(): void {
        const type = this.m_Creep_types.Peek()


        if (type !== null) {
            const name = `creep-${Date.now()}`
            let creation

            const energy = this.m_Room.GetEnergyCapacity()
            let body_type: Array<BodyPartConstant> = CreepBuilder.WORKER_BODY

            if (type === DEFENDER_TYPE) {
                body_type = CreepBuilder.DEFENDER_BODY
                let defender_body = CreepBuilder.BuildScalableDefender(energy)
                creation = this.m_Colony_queen?.spawnCreep(defender_body, name)
            }
            else {
                let worker_body = CreepBuilder.BuildScalableWorker(energy)
                creation = this.m_Colony_queen?.spawnCreep(worker_body, name)
            }

            if (creation === OK) {
                this.GetCreepNames().push(name)
                this.m_Creeps_count++
                const creep_wrap = new CreepWrapper(name, this.m_Room)
                creep_wrap.SetBehavior(type)
                this.m_Creep_types.Pop()
                this.m_Creeps.push(creep_wrap)
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
            console.log(`count: ${count}`)
            if (count > 0) {
                const names = this.m_Type_tracker.GetNamesByLevel(level)
                console.log(`level: ${level}`)
                
                const filter: Filter = (sender, other): boolean => {
                    return other.SignalRecieverID() === names[0]
                }

                const signal: Signal = {
                    from: this,
                    data: null,
                    method: (sender, reciever): boolean => {
                        const creep = (reciever as CreepWrapper)
                        this.m_Type_tracker.Remove(creep.GetBehavior(), creep.GetName())
                        creep.SetBehavior(HARVEST_TYPE)
                        this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName())
                        console.log("converting to harvester")
                        return true;
                    }
                }

                SignalManager.Inst().SendSignal(signal, filter)
                
                break
            }
        }
    }

    OnLoad(): void {
        const creep_names = this.GetCreepNames()

        for (var creep_name of creep_names) {
            if (creep_name !== this.m_Colony_queen?.spawning?.name) {
                const wrapper = new CreepWrapper(creep_name, this.m_Room)
                this.m_Creeps.push(wrapper)
                this.m_Creeps_count++
            }
        }

    }

    OnRun(): void {
        if (this.m_Colony_queen) {

            for (let creep of this.m_Creeps) {
                this.m_Type_tracker.Add(creep.GetBehavior(), creep.GetName())
            }

            const harvester_count = this.m_Type_tracker.GetTypeCount(HARVEST_TYPE)
            const max = this.m_Type_queue.GetMax(HARVEST_TYPE)

            if (max !== -1 && harvester_count < max) {
                this.ConvertToHarvester()
            }

            this.m_Creep_types = this.m_Type_queue.CreateStack(this.m_Type_tracker)

            if (this.m_Creep_types.Size() > 0) {
                this.SpawnCreep()
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