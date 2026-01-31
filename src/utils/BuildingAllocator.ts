import { RoomData } from "Rooms/RoomData"

export class BuildingAllocator {
    private static structs = new Map<StructureConstant, Array<string>>()
    private static used_struct_indexes = new Map<StructureConstant, Map<number, string>>()
    private static id_to_struct = new Map<string, string>()

    public static GetStructureId(type: StructureConstant, id: string) {
        if (!this.structs.has(type)) {
            const STRUCT_ARR = [
                ...RoomData.GetRoomData().GetOwnedStructureIds([type]),
                ...RoomData.GetRoomData().GetRoomStructures([type])
            ]

            this.structs.set(type, STRUCT_ARR)
            this.used_struct_indexes.set(type, new Map())
        }

        if (this.id_to_struct.has(id)) {
            const STRUCT_ID = this.id_to_struct.get(id)!
            return STRUCT_ID
        }

        const STRUCT_ARR = this.structs.get(type)!
        const INDEX_MAP = this.used_struct_indexes.get(type)!
        let struct_id: string | null = null

        for (let i = 0; i < STRUCT_ARR.length; i++) {
            if (!INDEX_MAP.has(i)) {
                const STRUCT = STRUCT_ARR[i]
                struct_id = STRUCT
                this.id_to_struct.set(id, struct_id)
                INDEX_MAP.set(i, id)
                break
            }
        }

        return struct_id
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
}
