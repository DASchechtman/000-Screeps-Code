import { COLONY_TYPE, CREEP_TYPE, MAX_SIGNALS } from "../Constants/GameObjectConsts";
import { CreepBuilder } from "../Creep/CreepBuilder";
import { DEFENDER_BEHAVIOR, HARVEST_BEHAVIOR, HAS_NO_BEHAVIOR, REPAIR_BEHAVIOR } from "../Constants/CreepBehaviorConsts";
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
import { PriorityQueue } from "../DataStructures/PriorityQueue";

export class Colony extends GameObject {

    private m_Room: RoomWrapper
    private m_Colony_queen: StructureSpawn | null;
    private m_Creep_types: Stack<number>
    private m_Creeps: Array<CreepWrapper>
    private m_Creeps_list: JsonObj
    private m_Data_key: string
    private m_Type_tracker: CreepTypeTracker
    private m_Type_queue: CreepTypeQueue

    constructor(room_name: string) {
        super(room_name, COLONY_TYPE, MAX_SIGNALS, true, true)
        this.m_Room = new RoomWrapper(room_name)
        this.m_Colony_queen = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
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
        const behavior = this.m_Creep_types.Pop()
        return behavior
    }

    private CreateStack(): void {
        if (this.m_Creep_types.IsEmpty()) {
            this.m_Creep_types = this.m_Type_queue.CreateStack(this.m_Type_tracker)
        }
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

        for (var creep_name of creep_names) {
            if (creep_name !== this.m_Colony_queen?.spawning?.name) {
                const wrapper = new CreepWrapper(creep_name, this.m_Room)
                wrapper.MakeReadyToRun()
                this.m_Creeps.push(wrapper)
            }
        }
    }

    private OnLoadStructs(): void {
        const structs = this.m_Room.GetAllNonHostileStructs()
        const queue = new PriorityQueue<{ type: number, s: Structure }>(function (el) {
            const regular = 1
            const timed = .99
            const health_percent = (el.s.hits / el.s.hitsMax) * 100

            let sort_val = regular + health_percent

            if (el.s.structureType === STRUCTURE_WALL || el.s.structureType === STRUCTURE_RAMPART) {
                sort_val = timed + health_percent
            }

            return health_percent
        })

        const timed_type = 0
        const reg_type = 1
        let type = -1

        for (let s of structs) {
            switch (s.structureType) {
                case STRUCTURE_ROAD:
                case STRUCTURE_RAMPART: {
                    queue.Push({ type: timed_type, s: s })
                    type = timed_type
                    break
                }
                case STRUCTURE_TOWER:
                case STRUCTURE_LINK: {
                    new BehaviorStructureWrapper(s.id)
                    break
                }
                default: {
                    queue.Push({ type: reg_type, s: s })
                    type = reg_type
                    break
                }
            }
        }

        const struct = queue.Peek()

        if (struct && struct?.type === reg_type) {
            new StructureWrapper(struct.s.id)
        }
        else if (struct && struct.type === timed_type) {
            new TimedStructureWrapper(struct.s.id)
        }
    }

    private StartSafeMode(): void {
        const controller = this.m_Room?.GetController()

        if (controller) {
            const still_safe = controller.safeMode
            const avalible_safe_mode = controller.safeModeAvailable
            const cool_down = controller.safeModeCooldown
            if (!still_safe && avalible_safe_mode > 0 && !cool_down) {
                controller.activateSafeMode()
            }
        }
    }

    OnLoad(): void {
        this.OnLoadCreeps()
        this.OnLoadStructs()
    }

    OnRun(): void {
        //this.StartSafeMode()
        if (this.m_Colony_queen) {

            const behaviorless_creeps = new Array<CreepWrapper>()

            for (let creep of this.m_Creeps) {

                let spawnning_creep = this.m_Colony_queen.spawning?.name

                if (creep.GetBehavior() === HAS_NO_BEHAVIOR && creep.GetName() !== spawnning_creep) {
                    behaviorless_creeps.push(creep)
                }
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

            for (let creep of behaviorless_creeps) {
                this.CreateStack()
                creep.SetBehavior(this.UpdateData()!!)
            }

            const harvester_count = this.m_Type_tracker.GetTypeCount(HARVEST_BEHAVIOR)
            const max = this.m_Type_queue.GetMax(HARVEST_BEHAVIOR)


            this.CreateStack()


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