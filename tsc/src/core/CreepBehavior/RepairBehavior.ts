import { ActionDistance } from "../../consts/CreepBehaviorConsts"
import { GameEntityTypes } from "../../consts/GameConstants"
import { JsonObj, Signal, SignalMessage } from "../../types/Interfaces"
import { PriorityStructuresStack } from "../../utils/datastructures/PriorityStructuresStack"
import { HardDrive } from "../../utils/harddrive/HardDrive"
import { CreepWrapper } from "../CreepWrapper"
import { RoomWrapper } from "../room/RoomWrapper"
import { SourceWrapper } from "../SourceWrapper"
import { StructureWrapper } from "../StructureWrapper"
import { CreepBehavior } from "./CreepBehavior"


export class RepairBehavior extends CreepBehavior {

    private m_Data: JsonObj = {}
    private m_Struct_Stack: PriorityStructuresStack | null = null
    private m_Max_time = 10

    constructor(wrapper: CreepWrapper) {
        super(wrapper)
    }

    private GetStack(): PriorityStructuresStack {
        if (!this.m_Struct_Stack) {
            this.m_Struct_Stack = new PriorityStructuresStack()
        }

        return this.m_Struct_Stack
    }

    Init(creep: Creep): void {}

    Load(creep: Creep): void {

        const data_behavior = HardDrive.ReadFolder(this.GetFolderPath(creep))
        const cur_state = data_behavior?.full === undefined ? false : data_behavior.full as boolean
        const cur_tick = typeof data_behavior?.tick === 'number' ? data_behavior.tick : 0
        let new_id = data_behavior?.new_id as boolean
        const source_id = String(data_behavior?.source_id)

        if (new_id === undefined) {
            new_id = true
        }

        this.m_Data = {
            id: String(data_behavior?.id),
            full: this.UpdateWorkState(creep, cur_state),
            tick: cur_tick,
            new_id: new_id,
            source_id: source_id
        }
    }

    Run(creep: Creep, room: RoomWrapper): void {
        let source = Game.getObjectById(this.m_Data.source_id as Id<Source>)


        if (this.m_Data.full) {
            let id = this.SetStruct()
            let struct = Game.getObjectById(id)
            const stack = this.GetStack()

            // a struct can be destroyed and so not
            // exist, but other structs still do
            // and need repairing
            while(stack.Size() > 0 && !struct) {
                id = this.SetStruct()
                struct = Game.getObjectById(id)
            }

            if (struct) {
                this.Repair(creep, struct)
            }
            else {
                creep.suicide()
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
                this.m_Data.source_id = source.id
                this.Harvest(source)
            }
        }


    }

    Save(creep: Creep): void {
        HardDrive.WriteFiles(this.GetFolderPath(creep), this.m_Data) 
    }

    Destroy(creep: Creep | null): void {
        this.m_Struct_Stack = null
    }

    ReceiveSignal(signal: SignalMessage): boolean {
        let was_processed = false
        const stack = this.GetStack()
        const struct_list = stack.ToArray()
        if (
            (signal.sender.GetType() === GameEntityTypes.BEHAVIOR_STRUCT
            || signal.sender.GetType() === GameEntityTypes.STRUCT
            || signal.sender.GetType() === GameEntityTypes.DEGRADABLE_STRUCT)
            && !struct_list.includes(signal.sender as StructureWrapper<any>)
        ) {
            was_processed = true
            stack.Add(signal.sender as StructureWrapper<any>)
        }

        return was_processed
    }

    private Repair(creep: Creep, struct: Structure<any>) {
        if (!this.MoveTo(ActionDistance.REPAIR, struct)) {
            creep.repair(struct)
            this.IncCounter()
        }
    }

    private IncCounter(): void {
        this.m_Data.tick = (this.m_Data.tick as number) + 1
        if (this.m_Data!!.tick === this.m_Max_time) {
            this.m_Data.tick = 0
            this.m_Data.new_id = true
        }
    }

    private SetStruct(): Id<any> {
        let id: Id<any> = this.m_Data.id as Id<any>
        const stack = this.GetStack()

        if (this.m_Data.new_id) {
            const struct_wrapper = stack.Pop()

            if (struct_wrapper) {
                const new_id = String(struct_wrapper.GetStructure()?.id)
                this.m_Data.id = new_id
                id = new_id as Id<any>
            }

            this.m_Data.new_id = false
        }

        return id
    }

}