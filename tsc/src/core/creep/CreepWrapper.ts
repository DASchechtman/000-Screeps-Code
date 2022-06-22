import { Behavior } from "../../consts/CreepBehaviorConsts";
import { GameEntityTypes } from "../../consts/GameConstants";
import { JsonObj, SignalMessage } from "../../types/Interfaces";
import { ColonyMember } from "../ColonyMember";
import { BuildBehavior } from "./CreepBehavior/BuildBehavior";
import { CreepBehavior } from "./CreepBehavior/CreepBehavior";
import { DefendBehavior } from "./CreepBehavior/DefendBehavior";
import { HarvestBehavior } from "./CreepBehavior/HarvestBehavior";
import { RepairBehavior } from "./CreepBehavior/RepairBehavior";
import { UpgradeBehavior } from "./CreepBehavior/UpgradeBehavior";
import { RoomWrapper } from "../room/RoomWrapper";
import { JsonMap, JsonTreeNode, JsonType, NodeTypes } from "../../utils/harddrive/JsonTreeNode";

export class CreepWrapper extends ColonyMember {
    private behaviors = new Map<Behavior, CreepBehavior>()
    private s_Name: string
    private bi_Behavior_type: Behavior = Behavior.NONE
    private cb_Behavior: CreepBehavior | undefined = undefined
    private c_Creep: Creep | undefined = undefined
    private b_Not_run_yet = true
    private jm_creep_data: JsonMap

    constructor(creep_name: string, creep_data: JsonMap) {

        super(GameEntityTypes.CREEP, creep_name)

        this.RecordCreepDataIfNotPresent(creep_data)
        const behavior_data = creep_data.get("behavior_data")!!.GetData() as JsonMap


        this.behaviors.set(Behavior.HARVEST, new HarvestBehavior(this, behavior_data))
        this.behaviors.set(Behavior.UPGRADER, new UpgradeBehavior(this, behavior_data))
        this.behaviors.set(Behavior.DEFENDER, new DefendBehavior(this, behavior_data))
        this.behaviors.set(Behavior.BUILDER, new BuildBehavior(this, behavior_data))
        this.behaviors.set(Behavior.REPAIR, new RepairBehavior(this, behavior_data))

        this.cb_Behavior = this.behaviors.get(this.bi_Behavior_type)!!
        this.jm_creep_data = creep_data
        this.s_Name = creep_name
    }

    private RecordCreepDataIfNotPresent(creep_data: JsonMap) {
        let behavior_data_node = creep_data.get("behavior_data")
        let behavior_data = behavior_data_node?.GetData()

        const is_not_json_obj = !behavior_data_node || behavior_data_node.Type() !== NodeTypes.JSON_MAP
        if (is_not_json_obj) {
            behavior_data = new Map() as JsonMap
            behavior_data_node = new JsonTreeNode(behavior_data)
            creep_data.set("behavior_data", behavior_data_node)
        }

        let behavior_type_node = creep_data.get("behavior")

        const is_not_json_num = !behavior_type_node || behavior_type_node.Type() !== NodeTypes.JSON_NUM
        if (is_not_json_num) {
            behavior_type_node = new JsonTreeNode(0)
            creep_data.set("behavior", behavior_type_node)
        }

        this.bi_Behavior_type = behavior_type_node?.GetData() as number
    }

    public GetCreep(): Creep | undefined {
        if (!this.c_Creep) {
            this.c_Creep = Game.creeps[this.s_Name]
        }
        return this.c_Creep
    }

    public OnTickStart(): void {
        if (this.bi_Behavior_type !== Behavior.NONE) {
            this.cb_Behavior = this.behaviors.get(this.bi_Behavior_type)
        }
    }

    public OnTickRun(): void {
        const creep = this.GetCreep()
        if (creep && this.cb_Behavior) {
            const room = new RoomWrapper(creep.room.name)

            if (this.b_Not_run_yet) {
                this.cb_Behavior.InitCreep(creep)
                this.b_Not_run_yet = false
            }

            this.cb_Behavior.InitTick(creep)
            this.cb_Behavior.RunTick(creep, room)
            this.cb_Behavior.FinishTick(creep)
        }
        else {
            this.cb_Behavior?.DestroyCreep(null)
            this.m_Signal = {
                data: this.s_Name,
                sender: this,
                receiver_type: GameEntityTypes.COLONY
            }
        }
    }

    public OnTickEnd(): void { }

    public OnDestroy(): void {
        this.c_Creep = undefined
    }

    public ReceiveSignal(signal: SignalMessage): boolean {
        let was_processed = false

        if (this.cb_Behavior) {
            was_processed = this.cb_Behavior.ReceiveSignal(signal)
            this.m_Signal = {
                data: this.GetID(),
                sender: this,
                reciever_name: signal.sender.GetID()
            }
        }

        return was_processed
    }

    public GetBehavior(): number {
        return this.bi_Behavior_type
    }

    public SetBehavior(new_behavior: Behavior): void {
        const creep = this.GetCreep()

        if (!creep) { return }

        this.jm_creep_data.set("behavior", new JsonTreeNode(new_behavior))
        this.b_Not_run_yet = true
        this.bi_Behavior_type = new_behavior
        this.cb_Behavior = this.behaviors.get(new_behavior)!!
    }

    public GetDataToRecord(): JsonType {
        return this.jm_creep_data
    }
}