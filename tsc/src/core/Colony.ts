
import { Behavior } from "../consts/CreepBehaviorConsts";
import { GameEntityTypes } from "../consts/GameConstants";
import { JsonObj, SignalMessage } from "../types/Interfaces";
import { JsonList, JsonType } from "../types/Types";
import { BuildScalableDefender, BuildScalableWorker } from "../utils/creeps/CreepBuilder";
import { ColonyMemberMap } from "../utils/datastructures/ColonyMemberMap";
import { PriorityStructuresStack } from "../utils/datastructures/PriorityStructuresStack";
import { HardDrive } from "../utils/harddrive/HardDrive";
import { BehaviorStructureWrapper } from "./BehaviorStructureWrapper";
import { ColonyMember } from "./ColonyMember";
import { CreepWrapper } from "./CreepWrapper";
import { RoomWrapper } from "./room/RoomWrapper";
import { Spawner } from "./Spawner";
import { StructureWrapper } from "./StructureWrapper";

interface CreepDetails {
    name: string,
    type: Behavior
}

export class Colony extends ColonyMember {
    private m_Members: ColonyMemberMap
    private m_Creeps_in_colony: Array<CreepDetails>
    private m_Room: RoomWrapper

    constructor(room_name: string) {
        super(GameEntityTypes.COLONY, room_name)
        this.m_Members = new ColonyMemberMap()
        this.m_Room = new RoomWrapper(room_name)
        this.m_Creeps_in_colony = new Array()
    }

    private RememberCreepDetails(name: string, type: number): void {
        const path = HardDrive.Join(this.m_Room.GetName(), "creep_list")
        let details_list: JsonList = HardDrive.ReadFile(path) as JsonList

        if (details_list === null) {
            details_list = []
        }

        const creep_details: JsonList = [name, type]
        details_list.push(creep_details)

        HardDrive.WriteFile(path, details_list)
    }

    private ForgetCreepDetails() {
        const path = HardDrive.Join(this.m_Room.GetName(), "creep_list")
        HardDrive.DeleteFile(path)
    }

    private RecallCreepDetails(): Array<CreepDetails> {
        const path = HardDrive.Join(this.m_Room.GetName(), "creep_list")
        const details_list: JsonList = HardDrive.ReadFile(path) as JsonList
        const creep_details = new Array<CreepDetails>()

        if (details_list) {
            for (let detail of details_list) {
                const list = detail as JsonList
                creep_details.push({
                    name: list[0] as string,
                    type: list[1] as number
                })
            }
        }

        return creep_details
    }

    private Spawn(spawn_type: number): void {
        const spawn = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        const energy_cap = this.m_Room.GetEnergyCapacity()
        const name = `${this.m_Room.GetName()} - ${Date.now()}`
        let body: Array<BodyPartConstant>

        if (spawn_type === Behavior.DEFENDER) {
            body = BuildScalableDefender(energy_cap)
        }
        else {
            body = BuildScalableWorker(energy_cap)
        }

        if (spawn.spawnCreep(body, name) === OK) {
            console.log(`saving behavior to ${Behavior[spawn_type]}`)
            this.RememberCreepDetails(name, spawn_type)
        }

    }

    private InitCreep(): void {
        const creeps = this.m_Room.GetMyCreeps()

        for (let creep of creeps) {
            const has = this.m_Creeps_in_colony.find((col_creep) => {
                let exists_in_list: CreepDetails | undefined = undefined

                if (col_creep.name === creep.name) {
                    exists_in_list = col_creep
                }

                return exists_in_list
            })

            if (!has) {
                const wrapper = new CreepWrapper(creep.name)
                this.m_Creeps_in_colony.push({
                    name: creep.name,
                    type: wrapper.GetBehavior()
                })
            }
        }
    }

    private CreateStructQueue() {
        const structs_in_room = this.m_Room.GetAllNonHostileStructs()
        const stack = new PriorityStructuresStack()

        for (let struct of structs_in_room) {
            const wrapper = new StructureWrapper(struct.id)
            if (wrapper.GetType() === GameEntityTypes.BEHAVIOR_STRUCT) {
                const behavior_wrapper = new BehaviorStructureWrapper(struct.id)
                this.m_Members.Put(behavior_wrapper)
            }
            else {
                stack.Add(wrapper)
            }
        }

        return stack
    }

    private InitStructs() {
        const stack = this.CreateStructQueue()
        let limit = 10

        for (let i = 0; i < limit; i++) {
            const struct = stack.Pop()
            if (struct) {
                this.m_Members.Put(struct)
            }
            else {
                break
            }
        }
    }

    private ForgetCreep(name: string): boolean {
        let forgot = false
        const creeps = this.RecallCreepDetails()

        const remaining_creeps = creeps.filter((val) => { 
            let keep_creep = val.name !== name
            if (!keep_creep) {
                forgot = true
            }
            return keep_creep
        })

        this.ForgetCreepDetails()

        for (let c of remaining_creeps) {
            this.RememberCreepDetails(c.name, c.type)
        }


        return forgot
    }

    private RunSignal(member: ColonyMember, signal: SignalMessage): boolean {
        member.SetSignal(null)
        return member.ReceiveSignal(signal)
    }

    private ProcessSignal(signal: SignalMessage, colony: Colony) {
        const id = signal.reciever_name
        const type = signal.receiver_type
        let receiver: ColonyMember | undefined = undefined

        if (type === GameEntityTypes.COLONY) {
            if (typeof signal.data === 'string') {
                if (colony.ForgetCreep(signal.data)) {
                    colony.m_Members.DeleteById(signal.sender.GetID())
                }
            }
        }
        else if (id !== undefined && type !== undefined) {
            const members = this.m_Members.GetByType(type)
            if (members) {
                receiver = members.find((member) => { return member.GetID() === id })
                if (receiver) {
                    colony.RunSignal(receiver, signal)
                }
            }
        }
        else if (id !== undefined) {
            receiver = this.m_Members.GetByID(id)
            if (receiver) {
                colony.RunSignal(receiver, signal)
            }
        }
        else if (type !== undefined) {
            const members = this.m_Members.GetByType(type)
            if (members && members.length > 0) {
                for (let member of members) {
                    receiver = member
                    if (colony.RunSignal(receiver, signal)) {
                        break
                    }
                }
            }
        }

        const reply = receiver?.GetSignal()

        if (reply) {
            this.ProcessSignal(reply, colony)
        }
    }

    OnInit(): void {
        console.log("running init", this.m_Members.Size())
        this.InitCreep()
        //this.InitStructs()
    }

    OnLoad(): void {
        debugger
        this.m_Members.DeleteByType(GameEntityTypes.STRUCT)
        this.m_Members.DeleteByType(GameEntityTypes.TIMED_STRUCTURE)
        this.m_Members.DeleteByType(GameEntityTypes.BEHAVIOR_STRUCT)


        const spawn = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        const creep_details = this.RecallCreepDetails()
        const stack = this.CreateStructQueue()
        const limit = 10

        for (let creep_entry of creep_details) {
            if (!this.m_Members.HasMember(creep_entry.name) && creep_entry.name !== spawn.spawning?.name) {
                const wrapper = new CreepWrapper(creep_entry.name)
                wrapper.SetBehavior(creep_entry.type)
                this.m_Members.Put(wrapper)
            }
        }

        for (let i = 0; i < limit; i++) {
            const item = stack.Pop()

            if (item) {
                this.m_Members.Put(item)
            }
            else {
                break
            }
        }


    }

    OnRun(): void {
        const spawner = new Spawner(this.m_Room)
        spawner.TrackCreepTypes()

        const spawn_list = spawner.CreateSpawnList()
        if (spawn_list.length > 0) {
            this.Spawn(spawn_list[0])
        }

        this.m_Members.ForEach((member) => {
            member.OnLoad()
            member.OnRun()
            member.OnSave()
            member.OnDestroy()

            const signal = member.GetSignal()

            if (signal) {
                this.ProcessSignal(signal, this)
                member.SetSignal(null)
            }
        })
        spawner.UntrackCreepTypes()
    }

    OnSave(): void { }

    OnDestroy(): void { }

}