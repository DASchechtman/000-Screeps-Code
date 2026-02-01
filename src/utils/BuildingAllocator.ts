import { RoomData } from "Rooms/RoomData"
import { Timer } from "./Timer"
import { FindOwnedStructureType, FindStructureType, OwnedStructuresConstant, OwnedStructuresTypes } from "Consts"

export class BuildingAllocator {
    private static structs = new Map<StructureConstant, Array<Id<Structure<StructureConstant>>>>()
    private static used_struct_indexes = new Map<StructureConstant, Map<number, string>>()
    private static id_to_struct = new Map<string, Id<Structure<StructureConstant>>>()

    public static GetStructureId<K extends StructureConstant, S extends FindStructureType[K]>(type: K, id: string): Id<S> | null {
        if (!this.structs.has(type)) {
            const STRUCT_ARR: Array<Id<Structure<StructureConstant>>> = []

            if (OwnedStructuresTypes.some(x => x === type)) {
                STRUCT_ARR.push(...RoomData.GetRoomData().GetOwnedStructureIds(type as OwnedStructuresConstant))
            }
            else {
                STRUCT_ARR.push(...RoomData.GetRoomData().GetRoomStructures(type))
            }

            this.structs.set(type, STRUCT_ARR)
            this.used_struct_indexes.set(type, new Map())
        }
        else {
            const TIMER = new Timer(id)
            TIMER.StartTimer(10)

            if (TIMER.IsTimerDone()) {
                const STRUCT_ARR: Array<Id<Structure<StructureConstant>>> = []

                if (OwnedStructuresTypes.some(x => x === type)) {
                    STRUCT_ARR.push(...RoomData.GetRoomData().GetOwnedStructureIds(type as OwnedStructuresConstant))
                }
                else {
                    STRUCT_ARR.push(...RoomData.GetRoomData().GetRoomStructures(type))
                }

                this.structs.set(type, STRUCT_ARR)
            }
        }

        const STRUCT_ARR = this.structs.get(type)!
        const INDEX_MAP = this.used_struct_indexes.get(type)!
        const IDS_TO_REMOVE = new Array<Id<Structure<StructureConstant>>>()

        for (let id of STRUCT_ARR) {
            if (Game.getObjectById(id as Id<Structure>) == null) {
                IDS_TO_REMOVE.push(id)
            }
        }

        for (let invalid_struct_ids of IDS_TO_REMOVE) {
            this.RemoveStructureIdFromList(type, invalid_struct_ids)
        }

        if (this.id_to_struct.has(id)) {
            const STRUCT_ID = this.id_to_struct.get(id)!
            return STRUCT_ID as Id<S>
        }


        let struct_id: Id<Structure<StructureConstant>> | null = null

        for (let i = 0; i < STRUCT_ARR.length; i++) {
            if (!INDEX_MAP.has(i)) {
                const STRUCT = STRUCT_ARR[i]
                struct_id = STRUCT
                this.id_to_struct.set(id, struct_id)
                INDEX_MAP.set(i, id)
                break
            }
        }

        return struct_id as Id<S>
    }

    public static RemoveStructureId(type: StructureConstant, id: string) {
        if (this.id_to_struct.has(id)) {
            const INDEXES_TO_UNMAP = new Array<number>()
            const MAPPING = this.used_struct_indexes.get(type)!
            this.id_to_struct.delete(id)

            for (let [index, used_id] of MAPPING) {
                if (id === used_id) {
                    INDEXES_TO_UNMAP.push(index)
                }
            }

            for (let index of INDEXES_TO_UNMAP) {
                MAPPING.delete(index)
            }
        }
    }

    public static RemoveStructureIdFromList(type: StructureConstant, invalid_struct_id: Id<Structure<StructureConstant>>) {
        if (this.structs.has(type)) {
            const ARR = this.structs.get(type)!
            const INDEX = ARR.indexOf(invalid_struct_id)
            if (INDEX >= 0) { ARR.splice(INDEX, 1) }

            for (let [creep_id, struct_id] of this.id_to_struct) {
                if (struct_id === invalid_struct_id) {
                    this.RemoveStructureId(type, creep_id)
                }
            }
        }
    }
}
