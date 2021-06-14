import { HARVEST_TYPE, UPGRADER_TYPE } from "../Creep/CreepTypes";
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

    constructor(room_name: string) {
        super()
        this.m_Room = new RoomWrapper(room_name)
        this.m_Colony_queen = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        this.m_Creeps_count = 0
        this.m_Creep_types = new Stack()
    }

    private SpawnCreep(): void {
        const name = `creep-${new Date().getTime()}`
        const creation = this.m_Colony_queen?.spawnCreep([WORK, MOVE, CARRY], name)

        if (creation === OK) {
            this.m_Creeps_count++
            const type = this.m_Creep_types.Pop()
            const creep_wrap = new CreepWrapper(name, this.m_Room)

            if (type !== null) {
                creep_wrap.SetType(type)
            }
        }
    }

    OnLoad(): void {
        this.m_Creep_types.Push(HARVEST_TYPE)
        this.m_Creep_types.Push(HARVEST_TYPE)
        this.m_Creep_types.Push(HARVEST_TYPE)
        this.m_Creep_types.Push(HARVEST_TYPE)
        this.m_Creep_types.Push(HARVEST_TYPE)
        this.m_Creep_types.Push(UPGRADER_TYPE)
        this.m_Creep_types.Push(UPGRADER_TYPE)
        this.m_Creep_types.Push(UPGRADER_TYPE)
        this.m_Creep_types.Push(UPGRADER_TYPE)
        this.m_Creep_types.Push(UPGRADER_TYPE)

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
    }
}