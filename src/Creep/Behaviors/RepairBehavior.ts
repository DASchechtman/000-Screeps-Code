import { JsonObj, Signal } from "../../CompilerTyping/Interfaces";
import { StructuresStack } from "../../DataStructures/StructuresStack";
import { HardDrive } from "../../Disk/HardDrive";
import { RoomWrapper } from "../../Room/RoomWrapper";
import { StructureWrapper } from "../../Structure/StructureWrapper";
import { CreepBehavior } from "./CreepBehavior";

export class RepairBehavior extends CreepBehavior {

    private m_Data: JsonObj = {}
    private m_Struct_Stack = new StructuresStack()
    private m_Max_time = 10

    Load(creep: Creep): void {

        const data_behavior = this.GetBehavior(creep)
        const cur_state = Boolean(data_behavior?.full)
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
            const id = this.SetStruct()
            const struct = Game.getObjectById(id)
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
            }

            if (source) {
                this.m_Data.source_id = source.id
                this.Harvest(creep, source)
            }
        }


    }

    Save(creep: Creep): void {
        const data = HardDrive.Read(creep.name) as JsonObj
        data.behavior = this.m_Data
        HardDrive.Write(creep.name, data)
    }

    Signal(signal: Signal): boolean {
        this.m_Struct_Stack.Add(signal.from as StructureWrapper<any>)
        return true
    }

    private Repair(creep: Creep, struct: Structure<any>) {
        if (this.MoveTo(creep.repair(struct), creep, struct)) {
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

        if (this.m_Data.new_id) {
            console.log("setting id")
            const struct_wrapper = this.m_Struct_Stack.Pop()
            console.log(struct_wrapper)

            if (struct_wrapper) {
                const new_id = String(struct_wrapper.GetStructure()?.id)
                this.m_Data.id = new_id
                id = new_id as Id<any>
            }

            console.log(`id is set to: ${id}`)
            this.m_Data.new_id = false
        }

        return id
    }

}