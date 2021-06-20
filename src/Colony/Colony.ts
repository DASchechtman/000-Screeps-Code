import { throws } from "assert";
import { COLONY_TYPE, CREEP_TYPE } from "../Consts";
import { CreepBuilder } from "../Creep/CreepBuilder";
import { BUILDER_TYPE, DEFENDER_TYPE, HARVEST_TYPE, UPGRADER_TYPE } from "../Creep/CreepTypes";
import { CreepWrapper } from "../Creep/CreepWrapper";
import { HarvestBehavior } from "../Creep/HarvestBehavior";
import { Stack } from "../DataStructures/Stack";
import { HardDrive, JsonObj } from "../Disk/HardDrive";
import { EventManager } from "../Events/EventManager";
import { GameObject } from "../GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";
import { Filter, Method, Signal, SignalManager } from "../Signals/SignalManager";

export class Colony extends GameObject {

    private m_Room: RoomWrapper
    private m_Colony_queen: StructureSpawn | null;
    private m_Creeps_count: number;
    private m_Creep_types: Stack<number>
    private m_Creeps: Array<CreepWrapper>
    private m_Creep_cap: number
    private m_Being_invaded: boolean
    private m_Creeps_name_data: JsonObj
    private m_Data_key: string

    constructor(room_name: string) {
        super(room_name, COLONY_TYPE)
        this.m_Room = new RoomWrapper(room_name)
        this.m_Colony_queen = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        this.m_Creeps_count = 0
        this.m_Creep_cap = 10
        this.m_Being_invaded = false
        this.m_Creep_types = new Stack()
        this.m_Creeps_name_data = {}
        this.m_Data_key = "creeps"
        this.m_Creeps = new Array()
    }

    private SpawnCreep(): void {
        const type = this.m_Creep_types.Peek()


        if (type !== null) {
            const name = `creep-${new Date().getTime()}`
            let creation

            const energy = this.m_Room.GetEnergyCapacity()
            let body: Array<BodyPartConstant> = CreepBuilder.WORKER_BODY

            if (type === DEFENDER_TYPE) {
                body = CreepBuilder.DEFENDER_BODY
                creation = this.m_Colony_queen?.spawnCreep(CreepBuilder.BuildScalableDefender(energy), name)
            }
            else {
                creation = this.m_Colony_queen?.spawnCreep(CreepBuilder.BuildScalableWorker(energy), name)
            }

            if (creation === ERR_NOT_ENOUGH_ENERGY) {
                creation = this.m_Colony_queen?.spawnCreep(body, name)
            }

            if (creation === OK) {
                console.log("adding name");
                (this.m_Creeps_name_data[this.m_Data_key] as Array<string>).push(name)
                this.m_Creeps_count++
                const creep_wrap = new CreepWrapper(name, this.m_Room)
                creep_wrap.SetType(type)
                this.m_Creep_types.Pop()
                this.m_Creeps.push(creep_wrap)
            }
        }
    }

    private LoadBuilderTypes(): void {
        const sites = this.m_Room.GetConstructionSites()

        if (sites.length > 0) {
            let builders = Math.floor(sites.length / 25)

            if (builders === 0) {
                builders = 1
            }

            if (sites.length + builders > this.m_Creep_cap) {
                builders = sites.length + builders - this.m_Creep_cap
            }

            for (let i = 0; i < builders; i++) {
                this.m_Creep_types.Push(BUILDER_TYPE)
            }

        }
    }

    private LoadDefenderTypes(): void {
        const enemies = this.m_Room.GetHostileCreeps()

        if (enemies.length > 0) {

            if (enemies.length + this.m_Creep_types.Size() > this.m_Creep_cap) {
                this.m_Creep_cap = enemies.length + this.m_Creep_types.Size()
            }

            for (let i = 0; i < enemies.length; i++) {
                this.m_Creep_types.Push(DEFENDER_TYPE)
            }
        }
    }

    private LoadTypes(): void {
        this.m_Creep_types.Push(HARVEST_TYPE)
        this.m_Creep_types.Push(HARVEST_TYPE)
        this.m_Creep_types.Push(UPGRADER_TYPE)
        this.m_Creep_types.Push(UPGRADER_TYPE)

        this.LoadDefenderTypes()
        this.LoadBuilderTypes()

        while (this.m_Creep_types.Size() < this.m_Creep_cap) {
            this.m_Creep_types.Push(HARVEST_TYPE)
        }

    }

    private IsInvaded() {
        return this.m_Room.GetHostileCreeps().length > 0
    }

    OnLoad(): void {
        this.LoadTypes()
        const data = HardDrive.Read(this.m_Room.GetName())

        if (data[this.m_Data_key]) {
            this.m_Creeps_name_data[this.m_Data_key] = data[this.m_Data_key]
        }
        else {
            this.m_Creeps_name_data[this.m_Data_key] = new Array<string>()
        }

        for (var creep_name of this.m_Creeps_name_data[this.m_Data_key] as Array<string>) {
            if (creep_name !== this.m_Colony_queen?.spawning?.name) {
                console.log("creating new creep")
                this.m_Creeps.push(new CreepWrapper(creep_name, this.m_Room))
                this.m_Creep_types.Pop()
                this.m_Creeps_count++
            }
        }

    }

    OnRun(): void {
        if (this.m_Colony_queen) {
            if (this.m_Creeps_count < this.m_Creep_cap) {
                this.SpawnCreep()
            }
        }
    }

    OnSave(): void {
        HardDrive.Write(this.m_Room.GetName(), this.m_Creeps_name_data)
    }

    RemoveFromMemory(name: string): void {
        const creep_names = this.m_Creeps_name_data[this.m_Data_key] as Array<string>

        const index = creep_names.indexOf(name)

        if (index > -1) {
            creep_names.splice(index, 1)
        }
    }

    ResetBehaviors() {
        this.m_Creep_types.Clear()
        this.LoadTypes()
        for (let creep of this.m_Creeps) {
            const type = this.m_Creep_types.Pop()
            if (type) {
                creep.SetType(type)
            }
        }
    }
}