import { RoomData } from "Rooms/RoomData"

export class BuildingAllocator {
    private static structs = new Map<StructureConstant, Array<string>>()
    private static used_struct_indexes = new Map<number, string>()
    private static id_to_struct = new Map<string, string>()

    public static GetStructureId(type: StructureConstant, id: string) {
        if (!this.structs.has(type)) {
            const STRUCT_ARR = [
                ...RoomData.GetRoomData().GetOwnedStructureIds([type]),
                ...RoomData.GetRoomData().GetRoomStructures([type])
            ]

            this.structs.set(type, STRUCT_ARR)
        }

        if (this.id_to_struct.has(id)) {
            return this.id_to_struct.get(id)!
        }

        const STRUCT_ARR = this.structs.get(type)!
        let struct_id = ""

        for (let i = 0; i < STRUCT_ARR.length; i++) {
            if (!this.used_struct_indexes.has(i)) {
                const STRUCT = STRUCT_ARR[i]
                struct_id = STRUCT
                this.id_to_struct.set(id, struct_id)
                this.used_struct_indexes.set(i, id)
                break
            }
        }

        return struct_id
    }

    public static RemoveStructureId(type: StructureConstant, id: string) {
        if (this.id_to_struct.has(id)) {
            const INDEXES_TO_UNMAP = new Array<number>()
            this.id_to_struct.delete(id)

            for (let [index, used_id] of this.used_struct_indexes) {
                if (id === used_id) {
                    INDEXES_TO_UNMAP.push(index)
                }
            }

            for (let index of INDEXES_TO_UNMAP) {
                this.used_struct_indexes.delete(index)
            }
        }
    }
}
