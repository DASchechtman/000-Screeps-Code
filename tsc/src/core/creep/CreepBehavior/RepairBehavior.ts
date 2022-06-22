import { ActionDistance } from "../../../consts/CreepBehaviorConsts"
import { GameEntityTypes } from "../../../consts/GameConstants"
import { JsonObj, SignalMessage } from "../../../types/Interfaces"
import { PriorityStructuresStack } from "../../../utils/datastructures/PriorityStructuresStack"
import { JsonMap } from "../../../utils/harddrive/JsonTreeNode"
import { CreepWrapper } from "../../creep/CreepWrapper"
import { RoomWrapper } from "../../room/RoomWrapper"
import { SourceWrapper } from "../../SourceWrapper"
import { StructureWrapper } from "../../structure/StructureWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class RepairBehavior extends CreepBehavior {

    private m_Struct_Stack: PriorityStructuresStack | null = null
    private m_Max_time = 10

    private s_source_id = ""
    private s_struct_id = ""
    private b_full = false
    private b_get_new_id = true
    private n_tick = 0

    private readonly s_source_id_key = "source id"
    private readonly s_struct_id_key = "struct id"
    private readonly s_full_key = "full"
    private readonly s_get_new_id_key = "new id"
    private readonly s_tick_key = "tick count"

    constructor(wrapper: CreepWrapper, behavior_data: JsonMap) {
        super(wrapper, behavior_data)
    }

    private GetStack(): PriorityStructuresStack {
        if (!this.m_Struct_Stack) {
            this.m_Struct_Stack = new PriorityStructuresStack()
        }

        return this.m_Struct_Stack
    }

    InitCreep(creep: Creep): void {}

    InitTick(creep: Creep): void {
        this.s_source_id = this.GetJsonDataIfAvalible(this.s_source_id_key, this.s_source_id) as string
        this.s_struct_id = this.GetJsonDataIfAvalible(this.s_struct_id_key, this.s_struct_id) as string
        this.b_full = this.GetJsonDataIfAvalible(this.s_full_key, this.b_full) as boolean
        this.b_get_new_id = this.GetJsonDataIfAvalible(this.s_get_new_id_key, this.b_get_new_id) as boolean
        this.n_tick = this.GetJsonDataIfAvalible(this.s_tick_key, this.n_tick) as number
    }

    RunTick(creep: Creep, room: RoomWrapper): void {
        let source = Game.getObjectById(this.s_source_id as Id<Source>)

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            this.b_full = false
        }
        else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity()) {
            this.b_full = true
        }

        


        if (this.b_full) {
            let id = this.SetStruct()
            let struct = Game.getObjectById(id)
            const stack = this.GetStack()

            const GetNextStruct = () => {
                id = this.SetStruct()
                struct = Game.getObjectById(id)
            }

            // a struct can be destroyed and so not
            // exist, but other structs still do
            // and need repairing
            const size = stack.Size()
            for (let i = 0; i < size; i++) {
                if (struct) {
                    break
                }
                this.b_get_new_id = true
                GetNextStruct()
            }

            console.log("repair info", size, struct)

            if (struct) {
                this.Repair(creep, struct)
            }
        }
        else {
            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES)
                if (!new SourceWrapper(source!!.id).HasFreeSpot()) {
                    source = this.GetSource(creep, room)
                }
            }

            if (source) {
                this.s_source_id = source.id
                this.Harvest(source, room)
            }
        }


    }

    FinishTick(creep: Creep): void {
        this.m_Struct_Stack?.Clear()
        this.StoreDataInJsonMap(
            [this.s_full_key, this.s_tick_key, this.s_source_id_key, this.s_struct_id_key, this.s_get_new_id_key],
            [this.b_full, this.n_tick, this.s_source_id, this.s_struct_id, this.b_get_new_id]
        )
    }

    DestroyCreep(creep: Creep | null): void {
        this.m_Struct_Stack = null
    }

    ReceiveSignal(signal: SignalMessage): boolean {
        let was_processed = false
        const stack = this.GetStack()

        if (
            (signal.sender.GetType() === GameEntityTypes.BEHAVIOR_STRUCT
            || signal.sender.GetType() === GameEntityTypes.STRUCT
            || signal.sender.GetType() === GameEntityTypes.DEGRADABLE_STRUCT)
        ) {
            was_processed = true
            stack.Add(signal.sender as StructureWrapper<any>)
        }

        return was_processed
    }

    private Repair(creep: Creep, struct: Structure<any>) {
       this.MoveTo(creep, struct, ActionDistance.REPAIR, () => {
        this.IncCounter()
        creep.repair(struct)
       })
    }

    private IncCounter(): void {
        this.n_tick++
        if (this.n_tick === this.m_Max_time) {
            this.n_tick = 0
            this.b_get_new_id = true
        }
    }

    private SetStruct(): Id<any> {
        let id: Id<any> = this.s_struct_id as Id<any>
        const stack = this.GetStack()

        if (this.b_get_new_id) {
            const struct_wrapper = stack.Pop()

            if (struct_wrapper) {
                const new_id = String(struct_wrapper.GetStructure()?.id)
                this.s_struct_id = new_id
                id = new_id as Id<any>
            }

            this.b_get_new_id = false
        }

        return id
    }

}