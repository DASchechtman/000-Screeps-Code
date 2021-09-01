
import { Behavior } from "../consts/CreepBehaviorConsts";
import { DEFENSE_DEV_LEVELS, EventTypes, GameEntityTypes } from "../consts/GameConstants";
import { JsonObj, Point, SignalMessage } from "../types/Interfaces";
import { JsonList, JsonType } from "../types/Types";
import { BuildScalableDefender, BuildScalableWorker, WORKER_BODY } from "../utils/creeps/CreepBuilder";
import { ColonyMemberMap } from "../utils/datastructures/ColonyMemberMap";
import { PriorityStructuresStack } from "../utils/datastructures/PriorityStructuresStack";
import { HardDrive } from "../utils/harddrive/HardDrive";
import { BehaviorStructureWrapper } from "./BehaviorStructureWrapper";
import { ColonyMember } from "./ColonyMember";
import { CreepWrapper } from "./CreepWrapper";
import { RoomWrapper } from "./room/RoomWrapper";
import { Spawner } from "../utils/creeps/Spawner";
import { StructureWrapper } from "./StructureWrapper";
import { DegradableStructureWrapper } from "./DegradableStructureWrapper";
import { EventManager } from "../utils/event_handler/EventManager";
import { xor } from "lodash";
import { ColonyPlanner } from "../utils/automation/ColonyPlanner";

interface CreepDetails {
    name: string,
    type: Behavior
}

export class Colony extends ColonyMember {
    private m_Members: ColonyMemberMap
    private m_Creeps_in_colony: CreepDetails[]
    private m_Room: RoomWrapper
    private m_Wall_made_file: string
    private m_Room_level_path: string
    private m_Spawn_type_tracker: Spawner

    constructor(room_name: string) {
        super(GameEntityTypes.COLONY, room_name)
        this.m_Members = new ColonyMemberMap()
        this.m_Room = new RoomWrapper(room_name)
        this.m_Creeps_in_colony = []
        this.m_Spawn_type_tracker = new Spawner(this.m_Room)
        this.m_Wall_made_file = HardDrive.Join(this.m_Room.GetName(), "wall-made")
        this.m_Room_level_path = HardDrive.Join(this.m_Room.GetName(), "level")
        const walls_build = HardDrive.ReadFile(this.m_Wall_made_file)
        const level = HardDrive.ReadFile(this.m_Room_level_path)
        HardDrive.WriteFile(this.m_Wall_made_file, walls_build === null ? false : walls_build)
        HardDrive.WriteFile(this.m_Room_level_path, level === null ? 1 : level)
    }

    private RememberCreepDetails(name: string, type: number): void {
        const path = HardDrive.Join(this.m_Room.GetName(), "creep_list")
        let details_list: JsonList = HardDrive.ReadFile(path) as JsonList

        if (details_list === null) {
            details_list = []
        }

        const creep_details: [string, number] = [name, type]
        details_list.push(creep_details)

        HardDrive.WriteFile(path, details_list)
    }



    private Spawn(spawn_type: number, tracker: Spawner): void {
        const spawn = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        const num_of_harvesters = tracker.GetTrackedType(Behavior.HARVEST)
        const energy_cap = this.m_Room.GetEnergyCapacity()
        const name = `${this.m_Room.GetName()} - ${Date.now()}`
        let body: BodyPartConstant[]

        if (spawn_type === Behavior.DEFENDER) {
            body = BuildScalableDefender(energy_cap)
        }
        else {
            body = BuildScalableWorker(energy_cap)
        }
        let ret = spawn.spawnCreep(body, name)

        console.log(num_of_harvesters)

        if (ret === OK) {
            console.log(`saving behavior to ${Behavior[spawn_type]}`)
            this.RememberCreepDetails(name, spawn_type)
        }
        else if (ret === ERR_NOT_ENOUGH_ENERGY && num_of_harvesters === 0) {
            ret = spawn.spawnCreep(WORKER_BODY, name)
            if (ret === OK) {
                this.RememberCreepDetails(name, spawn_type)
            }
        }

    }

    private ProcessSignal(signal: SignalMessage, colony: Colony) {
        const id = signal.reciever_name
        const type = signal.receiver_type
        let receiver: ColonyMember | undefined = undefined

        const RunSignal = function (member: ColonyMember, signal: SignalMessage): boolean {
            member.SetSignal(null)
            return member.ReceiveSignal(signal)
        }

        if (type === GameEntityTypes.COLONY) {
            colony.ReceiveSignal(signal)
        }
        else if (id !== undefined) {
            receiver = this.m_Members.GetByID(id)
            if (receiver) {
                RunSignal(receiver, signal)
            }
        }
        else if (type !== undefined) {
            const members = this.m_Members.GetByType(type)
            if (members && members.length > 0) {
                for (let member of members) {
                    receiver = member
                    if (RunSignal(receiver, signal)) {
                        break
                    }
                    else {
                        receiver = undefined
                    }
                }
            }
        }

        const reply = receiver?.GetSignal()

        if (reply) {
            this.ProcessSignal(reply, colony)
        }
    }

    private RecallCreepDetails(): CreepDetails[] {
        const path = HardDrive.Join(this.m_Room.GetName(), "creep_list")
        const details_list: JsonList = HardDrive.ReadFile(path) as JsonList
        const creep_details: CreepDetails[] = []

        if (details_list) {
            for (let detail of details_list) {
                const list = detail as JsonList

                if (list instanceof Array && list.length >= 2) {
                    creep_details.push({
                        name: list[0] as string,
                        type: list[1] as number
                    })
                }
            }
        }

        return creep_details
    }

    OnInit(): void {
        console.log("running init", this.m_Members.Size());

        const creeps = this.m_Room.GetMyCreeps()

        for (let creep of creeps) {

            // checking to see if a creep's detail should be added to the list
            const CheckForMissingCreeps = function (col_creep: CreepDetails) {
                let exists_in_list: CreepDetails | undefined = undefined

                if (col_creep.name === creep.name) {
                    exists_in_list = col_creep
                }

                return exists_in_list
            }

            const creep_not_found = this.m_Creeps_in_colony.find(CheckForMissingCreeps)

            if (creep_not_found) {
                const wrapper = new CreepWrapper(creep.name)
                this.m_Creeps_in_colony.push({
                    name: creep.name,
                    type: wrapper.GetBehavior()
                })
            }
        }
    }

    private UpgradeRoomResources(spawn: StructureSpawn): void {
        const controller = this.m_Room.GetController()
        const walls_made = HardDrive.ReadFile(this.m_Wall_made_file) as boolean
        const level = HardDrive.ReadFile(this.m_Room_level_path) as number
        const multiplyer = DEFENSE_DEV_LEVELS

        if (controller && controller?.level !== level && level < multiplyer) {
            console.log("building room", level)
            const spawn_point: Point = {
                x: spawn.pos.x,
                y: spawn.pos.y
            }
            const room_builder = ColonyPlanner.GetInst(this.m_Room.GetName())
            room_builder.Build(controller.level * multiplyer, spawn_point, this.m_Room)
            HardDrive.WriteFile(this.m_Room_level_path, controller.level)
        }
    }

    OnTickStart(): void {
        this.m_Spawn_type_tracker.TrackCreepTypes()
        if (!HardDrive.Has(this.m_Room.GetName())) {
            HardDrive.CreateFolder(this.m_Room.GetName())
        }
        const spawn = this.m_Room.GetOwnedStructures<StructureSpawn>(STRUCTURE_SPAWN)[0]
        const limit = 10;

        this.UpgradeRoomResources(spawn)

        // finding the 10 most damaged structs (and structs with behaviors like towers)
        // and adding them to the colony member list so they can run
        {
            // generate a queue of structure stacks made of all structs that
            // are mine or unowned
            const CreatePriorityStructQueue = () => {
                const structs_in_room = this.m_Room.GetAllNonHostileStructs()
                const stack = new PriorityStructuresStack()

                for (let struct of structs_in_room) {
                    switch (struct.structureType) {
                        // checks for structures that have functions
                        // attached that allow it to affect the game world
                        case STRUCTURE_TOWER:
                        case STRUCTURE_LINK:
                        case STRUCTURE_SPAWN: {
                            let wrapper = new BehaviorStructureWrapper(struct.id)
                            this.m_Members.Put(wrapper)
                            break
                        }

                        // checks for structures that loose health over time
                        case STRUCTURE_CONTAINER:
                        case STRUCTURE_RAMPART:
                        case STRUCTURE_ROAD: {
                            let wrapper = new DegradableStructureWrapper(struct.id)
                            stack.Add(wrapper)
                            break
                        }

                        // makes sure every other structure has a script to
                        // send a signal when it is damaged
                        default: {
                            let wrapper = new StructureWrapper(struct.id)
                            stack.Add(wrapper)
                        }
                    }
                }

                return stack
            }

            const priority_queue = CreatePriorityStructQueue()

            for (let i = 0; i < limit; i++) {
                const item = priority_queue.Pop()

                if (item) {
                    this.m_Members.Put(item)
                }
                else {
                    break
                }
            }
        }


        // creating new creep wrappers for any new creeps that are made after the
        // start of the program
        {
            // gets the list of creep name and behavior types [string, Behavior].
            // used later to test if the creep is dead
            const recalled_creep_details = this.RecallCreepDetails()

            for (let creep_entry of recalled_creep_details) {
                const does_not_have_member = !this.m_Members.HasMember(creep_entry.name)
                const not_spawning = creep_entry.name !== spawn.spawning?.name

                if (does_not_have_member && not_spawning) {
                    const wrapper = new CreepWrapper(creep_entry.name)
                    wrapper.SetBehavior(creep_entry.type)
                    this.m_Members.Put(wrapper)
                }
            }
        }


    }

    OnTickRun(): void {

        // checks for any events that need to be run
        {
            const hostile_creeps = this.m_Room.GetHostileCreeps().length
            let event: EventTypes | undefined = undefined

            if (hostile_creeps > 0) {
                event = EventTypes.INVASION
            }

            if (event !== undefined) {
                EventManager.GetInst().RunEvent(event)
            }
        }

        const spawn_list = this.m_Spawn_type_tracker.CreateSpawnList()
        if (spawn_list.length > 0) {
            this.Spawn(spawn_list[0], this.m_Spawn_type_tracker)
        }

        const run_members = (member: ColonyMember): void => {
            member.OnTickStart()
            member.OnTickRun()
            member.OnTickEnd()
            member.OnDestroy()

            const signal = member.GetSignal()

            if (signal) {
                this.ProcessSignal(signal, this)
                member.SetSignal(null)
            }
        }

        // gives me more control over which game objects will run have their 
        // code executed in what order
        this.m_Members.ForEachByType(GameEntityTypes.STRUCT, run_members)
        this.m_Members.ForEachByType(GameEntityTypes.DEGRADABLE_STRUCT, run_members)
        this.m_Members.ForEachByType(GameEntityTypes.BEHAVIOR_STRUCT, run_members)
        this.m_Members.ForEachByType(GameEntityTypes.CREEP, run_members)
    }

    OnTickEnd(): void { 
        this.m_Spawn_type_tracker.UntrackCreepTypes()
    }

    OnDestroy(): void {
        this.m_Members.DeleteByType(GameEntityTypes.STRUCT)
        this.m_Members.DeleteByType(GameEntityTypes.DEGRADABLE_STRUCT)
        this.m_Members.DeleteByType(GameEntityTypes.BEHAVIOR_STRUCT)
    }

    ReceiveSignal(signal: SignalMessage): boolean {
        let received = false

        // checks for if a creep died and sent a
        // signal to delete it from disk/memory
        if (typeof signal.data === 'string') {
            const ForgetCreep = (name: string) => {
                let forgot = false
                const creeps = this.RecallCreepDetails()

                // removes the creep in question by filtering
                // it out of the list
                const remaining_creeps = creeps.filter((val) => {
                    let keep_creep = val.name !== name
                    if (!keep_creep) {
                        forgot = true
                    }
                    return keep_creep
                })

                // deletes the entire creep list on disk
                const path = HardDrive.Join(this.m_Room.GetName(), "creep_list")
                HardDrive.DeleteFile(path)

                // saves all the creeps again (minus the one that was 
                // filtered out)
                for (let c of remaining_creeps) {
                    this.RememberCreepDetails(c.name, c.type)
                }

                return forgot
            }

            if (ForgetCreep(signal.data)) {
                received = true
                this.m_Members.DeleteById(signal.sender.GetID())
            }
        }

        // checks if spawn successfully created a new creep
        // and sent a signal to remember that creep's details
        else if (signal.data instanceof Array && signal.data.length === 2) {
            const item_1 = signal.data[0]
            const item_2 = signal.data[1]
            if (typeof item_1 === 'string' && typeof item_2 === 'number') {
                this.RememberCreepDetails(item_1, item_2)
            }
        }

        return received
    }

}