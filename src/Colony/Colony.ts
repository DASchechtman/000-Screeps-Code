import { CreepBuilder } from "../Creep/CreepBuilder";
import { BUILDER_TYPE, DEFENDER_TYPE, HARVEST_TYPE, UPGRADER_TYPE } from "../Creep/CreepTypes";
import { CreepWrapper } from "../Creep/CreepWrapper";
import { HarvestBehavior } from "../Creep/HarvestBehavior";
import { Stack } from "../DataStructures/Stack";
import { EventManager } from "../Events/EventManager";
import { GameObject } from "../Events/GameObject";
import { RoomWrapper } from "../Room/RoomWrapper";

export class Colony extends GameObject {

    private m_Room: RoomWrapper
    private m_Colony_queen: StructureSpawn | null;
    private m_Creeps_count: number;
    private m_Creep_types: Stack<number>
    private m_Creep_cap: number
    private m_Being_invaded: boolean

    constructor(room_name: string) {
        super()
        this.m_Room = new RoomWrapper(room_name)
        this.m_Colony_queen = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        this.m_Creeps_count = 0
        this.m_Creep_cap = 10
        this.m_Being_invaded = false
        this.m_Creep_types = new Stack()
    }

    private SpawnCreep(): void {
        const type = this.m_Creep_types.Peek()
        

        if (type !== null) {
            const name = `creep-${new Date().getTime()}`
            let creation

            if (type === DEFENDER_TYPE) {
                creation = this.m_Colony_queen?.spawnCreep(CreepBuilder.DEFENDER_BODY, name)
            }
            else {
                creation = this.m_Colony_queen?.spawnCreep(CreepBuilder.WORKER_BODY, name)
            }

            if (creation === OK) {
                this.m_Creeps_count++
                const creep_wrap = new CreepWrapper(name, this.m_Room)
                creep_wrap.SetType(type)
                this.m_Creep_types.Pop()
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
        for (var creep of this.m_Room.GetMyCreeps()) {
            let type = this.m_Creep_types.Pop()
            let creep_wrap = new CreepWrapper(creep.name, this.m_Room)
            if (type !== null) {
                creep_wrap.SetType(type)
            }
            this.m_Creeps_count++
        }
    }

    OnRun(): void {
        if (this.m_Colony_queen) {
            if (this.m_Creeps_count < 10) {
                this.SpawnCreep()
            }
        }

        if (this.IsInvaded()) {
            EventManager.Inst().Notify(EventManager.INVASION_EVENT)
        }
    }
}