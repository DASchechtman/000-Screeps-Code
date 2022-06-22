"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colony = void 0;
const GameConstants_1 = require("../consts/GameConstants");
const ColonyMemberMap_1 = require("../utils/datastructures/ColonyMemberMap");
const PriorityStructuresStack_1 = require("../utils/datastructures/PriorityStructuresStack");
const HardDrive_1 = require("../utils/harddrive/HardDrive");
const BehaviorStructureWrapper_1 = require("./structure/BehaviorStructureWrapper");
const ColonyMember_1 = require("./ColonyMember");
const CreepWrapper_1 = require("./creep/CreepWrapper");
const RoomWrapper_1 = require("./room/RoomWrapper");
const Spawner_1 = require("../utils/creeps/Spawner");
const StructureWrapper_1 = require("./structure/StructureWrapper");
const DegradableStructureWrapper_1 = require("./structure/DegradableStructureWrapper");
const EventManager_1 = require("../utils/event_handler/EventManager");
const ColonyPlanner_1 = require("../utils/automation/ColonyPlanner");
const JsonTreeNode_1 = require("../utils/harddrive/JsonTreeNode");
class Colony extends ColonyMember_1.ColonyMember {
    constructor(room_name) {
        super(GameConstants_1.GameEntityTypes.COLONY, room_name);
        this.m_Members = new ColonyMemberMap_1.ColonyMemberMap();
        this.m_Room = new RoomWrapper_1.RoomWrapper(room_name);
        this.m_Creeps_in_colony = [];
        this.m_Spawn_type_tracker = new Spawner_1.Spawner(this.m_Room);
        this.m_Wall_made_file = HardDrive_1.HardDrive.Join(this.m_Room.GetName(), "wall-made");
        this.m_Room_level_path = HardDrive_1.HardDrive.Join(this.m_Room.GetName(), "level");
        const walls_build = HardDrive_1.HardDrive.ReadFile(this.m_Wall_made_file);
        const level = HardDrive_1.HardDrive.ReadFile(this.m_Room_level_path);
        HardDrive_1.HardDrive.WriteFile(this.m_Wall_made_file, walls_build === null ? false : walls_build);
        HardDrive_1.HardDrive.WriteFile(this.m_Room_level_path, level === null ? 1 : level);
    }
    RememberCreepDetails(name, type) {
        const path = HardDrive_1.HardDrive.Join(this.m_Room.GetName(), "creep_list");
        let details_list = HardDrive_1.HardDrive.ReadFile(path);
        if (details_list === null) {
            details_list = [];
        }
        const creep_details = [new JsonTreeNode_1.JsonTreeNode(name), new JsonTreeNode_1.JsonTreeNode(type)];
        details_list.push(new JsonTreeNode_1.JsonTreeNode(creep_details));
        HardDrive_1.HardDrive.WriteFile(path, details_list);
    }
    ProcessSignal(signal, colony) {
        const id = signal.reciever_name;
        const type = signal.receiver_type;
        let receiver = undefined;
        const RunSignal = function (member, signal) {
            member.SetSignal(null);
            return member.ReceiveSignal(signal);
        };
        if (type === GameConstants_1.GameEntityTypes.COLONY) {
            colony.ReceiveSignal(signal);
        }
        else if (id !== undefined) {
            receiver = this.m_Members.GetByID(id);
            if (receiver) {
                RunSignal(receiver, signal);
            }
        }
        else if (type !== undefined) {
            const members = this.m_Members.GetByType(type);
            if (members && members.length > 0) {
                for (let member of members) {
                    receiver = member;
                    if (RunSignal(receiver, signal)) {
                        break;
                    }
                    else {
                        receiver = undefined;
                    }
                }
            }
        }
        const reply = receiver === null || receiver === void 0 ? void 0 : receiver.GetSignal();
        if (reply) {
            this.ProcessSignal(reply, colony);
        }
    }
    RecallCreepDetails() {
        const path = HardDrive_1.HardDrive.Join(this.m_Room.GetName(), "creep_list");
        const details_list = HardDrive_1.HardDrive.ReadFile(path);
        const creep_details = [];
        if (details_list) {
            for (let detail of details_list) {
                const list = detail.GetData();
                if (detail.Type() === JsonTreeNode_1.NodeTypes.JSON_ARRAY && list.length >= 2) {
                    creep_details.push({
                        name: list[0].GetData(),
                        type: list[1].GetData()
                    });
                }
            }
        }
        return creep_details;
    }
    IsTuple(data, types) {
        const is_right_type_and_len = data instanceof Array && data.length === types.length;
        if (!is_right_type_and_len) {
            return false;
        }
        let is_tuple = false;
        const tuple = data;
        for (let i = 0; i < tuple.length; i++) {
            if (typeof tuple[i] === types[i]) {
                is_tuple = true;
            }
            else {
                is_tuple = false;
                break;
            }
        }
        return is_tuple;
    }
    OnInit() {
        console.log("running init", this.m_Members.Size());
        const creeps = this.m_Room.GetMyCreeps();
        for (let creep of creeps) {
            const creep_not_found = !this.m_Creeps_in_colony.some(c => c.name === creep.name);
            if (creep_not_found) {
                const wrapper = new CreepWrapper_1.CreepWrapper(creep.name);
                wrapper.OnTickStart();
                this.m_Creeps_in_colony.push({
                    name: creep.name,
                    type: wrapper.GetBehavior()
                });
            }
        }
    }
    UpgradeRoomResources(spawn) {
        const controller = this.m_Room.GetController();
        const walls_made = HardDrive_1.HardDrive.ReadFile(this.m_Wall_made_file);
        const level = HardDrive_1.HardDrive.ReadFile(this.m_Room_level_path);
        const multiplyer = GameConstants_1.DEFENSE_DEV_LEVELS;
        if (controller && (controller === null || controller === void 0 ? void 0 : controller.level) !== level && level < multiplyer) {
            console.log("building room", level);
            const spawn_point = spawn.pos.ToPoint();
            const room_builder = ColonyPlanner_1.ColonyPlanner.GetInst(this.m_Room.GetName());
            room_builder.Build(controller.level, spawn_point, this.m_Room);
            HardDrive_1.HardDrive.WriteFile(this.m_Room_level_path, controller.level);
        }
    }
    OnTickStart() {
        var _a;
        this.m_Spawn_type_tracker.TrackCreepTypes();
        const spawn = this.m_Room.GetOwnedStructures(STRUCTURE_SPAWN)[0];
        const limit = 10;
        this.UpgradeRoomResources(spawn);
        // finding the 10 most damaged structs (and structs with behaviors like towers)
        // and adding them to the colony member list so they can run
        {
            // generate a queue of structure stacks made of all structs that
            // are mine or unowned
            const CreatePriorityStructQueue = () => {
                const structs_in_room = this.m_Room.GetAllNonHostileStructs();
                const stack = new PriorityStructuresStack_1.PriorityStructuresStack();
                for (let struct of structs_in_room) {
                    switch (struct.structureType) {
                        // checks for structures that have functions
                        // attached that allow it to affect the game world
                        case STRUCTURE_TOWER:
                        case STRUCTURE_LINK:
                        case STRUCTURE_SPAWN: {
                            let wrapper = new BehaviorStructureWrapper_1.BehaviorStructureWrapper(struct.id);
                            this.m_Members.Put(wrapper);
                            break;
                        }
                        // checks for structures that loose health over time
                        case STRUCTURE_CONTAINER:
                        case STRUCTURE_RAMPART:
                        case STRUCTURE_ROAD: {
                            let wrapper = new DegradableStructureWrapper_1.DegradableStructureWrapper(struct.id);
                            stack.Add(wrapper);
                            break;
                        }
                        // makes sure every other structure has a script to
                        // send a signal when it is damaged
                        default: {
                            let wrapper = new StructureWrapper_1.StructureWrapper(struct.id);
                            stack.Add(wrapper);
                        }
                    }
                }
                return stack;
            };
            const priority_queue = CreatePriorityStructQueue();
            for (let i = 0; i < limit; i++) {
                const item = priority_queue.Pop();
                if (item) {
                    this.m_Members.Put(item);
                }
                else {
                    break;
                }
            }
        }
        // creating new creep wrappers for any new creeps that are made after the
        // start of the program
        {
            // gets the list of creep name and behavior types [string, Behavior].
            // used later to test if the creep is dead
            const recalled_creep_details = this.RecallCreepDetails();
            for (let creep_entry of recalled_creep_details) {
                const does_not_have_member = !this.m_Members.HasMember(creep_entry.name);
                const not_spawning = creep_entry.name !== ((_a = spawn.spawning) === null || _a === void 0 ? void 0 : _a.name);
                if (does_not_have_member && not_spawning) {
                    const wrapper = new CreepWrapper_1.CreepWrapper(creep_entry.name);
                    wrapper.SetBehavior(creep_entry.type);
                    this.m_Members.Put(wrapper);
                }
            }
        }
    }
    OnTickRun() {
        // checks for any events that need to be run
        {
            const hostile_creeps = this.m_Room.GetHostileCreeps().length;
            let event = undefined;
            if (hostile_creeps > 0) {
                event = GameConstants_1.EventTypes.INVASION;
            }
            if (event !== undefined) {
                EventManager_1.EventManager.GetInst().RunEvent(event);
            }
        }
        const run_members = (member) => {
            member.OnTickStart();
            member.OnTickRun();
            member.OnTickEnd();
            member.OnDestroy();
            const signal = member.GetSignal();
            if (signal) {
                this.ProcessSignal(signal, this);
                member.SetSignal(null);
            }
        };
        // gives me more control over which game objects will run have their 
        // code executed in what order
        this.m_Members.ForEachByType(GameConstants_1.GameEntityTypes.STRUCT, run_members);
        this.m_Members.ForEachByType(GameConstants_1.GameEntityTypes.DEGRADABLE_STRUCT, run_members);
        this.m_Members.ForEachByType(GameConstants_1.GameEntityTypes.BEHAVIOR_STRUCT, run_members);
        this.m_Members.ForEachByType(GameConstants_1.GameEntityTypes.CREEP, run_members);
    }
    OnTickEnd() {
        this.m_Spawn_type_tracker.UntrackCreepTypes();
    }
    OnDestroy() {
        this.m_Members.DeleteByType(GameConstants_1.GameEntityTypes.STRUCT);
        this.m_Members.DeleteByType(GameConstants_1.GameEntityTypes.DEGRADABLE_STRUCT);
        this.m_Members.DeleteByType(GameConstants_1.GameEntityTypes.BEHAVIOR_STRUCT);
    }
    ReceiveSignal(signal) {
        let received = false;
        // checks for if a creep died and sent a
        // signal to delete it from disk/memory
        if (typeof signal.data === 'string') {
            const ForgetCreep = (name) => {
                let forgot = false;
                const creeps = this.RecallCreepDetails();
                // removes the creep in question by filtering
                // it out of the list
                const remaining_creeps = creeps.filter((val) => {
                    let keep_creep = val.name !== name;
                    if (!keep_creep) {
                        forgot = true;
                    }
                    return keep_creep;
                });
                // deletes the entire creep list on disk
                const path = HardDrive_1.HardDrive.Join(this.m_Room.GetName(), "creep_list");
                HardDrive_1.HardDrive.DeleteFile(path);
                // saves all the creeps again (minus the one that was 
                // filtered out)
                for (let c of remaining_creeps) {
                    this.RememberCreepDetails(c.name, c.type);
                }
                return forgot;
            };
            if (ForgetCreep(signal.data)) {
                received = true;
                this.m_Members.DeleteById(signal.sender.GetID());
            }
        }
        // checks if spawn successfully created a new creep
        // and sent a signal to remember that creep's details
        else if (this.IsTuple(signal.data, [typeof '', typeof 0])) {
            const tuple = signal.data;
            const name = tuple[0];
            const type = tuple[1];
            this.RememberCreepDetails(name, type);
        }
        return received;
    }
}
exports.Colony = Colony;
