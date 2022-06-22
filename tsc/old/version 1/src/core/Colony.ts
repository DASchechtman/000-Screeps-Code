
import { Behavior } from "../consts/CreepBehaviorConsts";
import { DEFENSE_DEV_LEVELS, EventTypes, GameEntityTypes } from "../consts/GameConstants";
import { JsonObj, Point, SignalMessage } from "../types/Interfaces";
import { ColonyMemberMap } from "../utils/datastructures/ColonyMemberMap";
import { PriorityStructuresStack } from "../utils/datastructures/PriorityStructuresStack";
import { HardDrive } from "../utils/harddrive/HardDrive";
import { BehaviorStructureWrapper } from "./structure/BehaviorStructureWrapper";
import { ColonyMember } from "./ColonyMember";
import { CreepWrapper } from "./creep/CreepWrapper";
import { RoomWrapper } from "./room/RoomWrapper";
import { Spawner } from "../utils/creeps/Spawner";
import { StructureWrapper } from "./structure/StructureWrapper";
import { DegradableStructureWrapper } from "./structure/DegradableStructureWrapper";
import { EventManager } from "../utils/event_handler/EventManager";
import { ColonyPlanner } from "../utils/automation/ColonyPlanner";
import { JsonArray, JsonTreeNode, NodeTypes } from "../utils/harddrive/JsonTreeNode";

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
        let details_list: JsonArray = HardDrive.ReadFile(path) as JsonArray

        if (details_list === null) {
            details_list = []
        }

        const creep_details = [new JsonTreeNode(name), new JsonTreeNode(type)]
        details_list.push(new JsonTreeNode(creep_details))

        HardDrive.WriteFile(path, details_list)
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
        const details_list = HardDrive.ReadFile(path) as JsonArray
        const creep_details: CreepDetails[] = []

        if (details_list) {
            for (let detail of details_list) {
                const list = detail.GetData() as JsonArray

                if (detail.Type() === NodeTypes.JSON_ARRAY && list.length >= 2) {
                    creep_details.push({
                        name: list[0].GetData() as string,
                        type: list[1].GetData() as number
                    })
                }
            }
        }

        return creep_details
    }

    private IsTuple(data: unknown, types: string[]): boolean {
        const is_right_type_and_len = data instanceof Array && data.length === types.length

        if (!is_right_type_and_len) {
            return false
        }

        let is_tuple = false
        const tuple = data as Array<any>
        
        for (let i = 0; i < tuple.length; i++) {
            if (typeof tuple[i] === types[i]) {
                is_tuple = true
            }
            else {
                is_tuple = false
                break
            }
        }

        return is_tuple
    }

    OnInit(): void {
        console.log("running init", this.m_Members.Size());

        const creeps = this.m_Room.GetMyCreeps()

        for (let creep of creeps) {

            const creep_not_found = !this.m_Creeps_in_colony.some(c => c.name === creep.name)

            if (creep_not_found) {
                const wrapper = new CreepWrapper(creep.name)
                wrapper.OnTickStart()
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
            const spawn_point = spawn.pos.ToPoint()
            const room_builder = ColonyPlanner.GetInst(this.m_Room.GetName())
            room_builder.Build(controller.level, spawn_point, this.m_Room)
            HardDrive.WriteFile(this.m_Room_level_path, controller.level)
        }
    }

    OnTickStart(): void {
        this.m_Spawn_type_tracker.TrackCreepTypes()
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
        else if (this.IsTuple(signal.data, [typeof '', typeof 0])) {
            const tuple = signal.data as Array<any>
            const name = tuple[0]
            const type = tuple[1]
            this.RememberCreepDetails(name, type)
        }

        return received
    }

}