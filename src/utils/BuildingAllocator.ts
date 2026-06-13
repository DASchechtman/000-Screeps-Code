import { RoomData } from "Rooms/RoomData";
import { Timer } from "./Timer";
import { FindOwnedStructureType, FindStructureType, OwnedStructuresConstant, OwnedStructuresTypes } from "Consts";


export class BuildingAllocator {
  private static creep_id_to_struct_id: Map<string, Id<Structure<StructureConstant>>> = new Map();
  private static struct_id_to_creep_id: Map<Id<Structure<StructureConstant>>, string> = new Map();
  private static struct_type_to_struct_ids: Map<StructureConstant, Array<Id<Structure<StructureConstant>>>> = new Map();
  private static room: RoomData = RoomData.GetRoomData();

  public static GetStructureId<K extends StructureConstant, S extends FindStructureType[K]>(
    type: K,
    creep_id: string
  ): Id<S> | null {
    if (!this.struct_type_to_struct_ids.has(type)) {
      const STRUCT_ARR = this.room.GetRoomStructures(type);
      this.struct_type_to_struct_ids.set(type, STRUCT_ARR);
    }

    if (this.creep_id_to_struct_id.has(creep_id)) {
      const STRUCT_ID = this.creep_id_to_struct_id.get(creep_id)!;
      return STRUCT_ID as Id<S>;
    }

    let i = 0;
    let struct_arr = this.struct_type_to_struct_ids.get(type)!;
    while (i < this.struct_type_to_struct_ids.get(type)!.length && this.struct_id_to_creep_id.has(struct_arr[i])) {
      i++;
    }

    if (i >= struct_arr.length) {
      return null;
    }

    const STRUCT_ID = struct_arr[i];
    this.creep_id_to_struct_id.set(creep_id, STRUCT_ID);
    this.struct_id_to_creep_id.set(STRUCT_ID, creep_id);
    return STRUCT_ID as Id<S>;
  }

  public static RemoveStructureId(type: StructureConstant, creep_id: string) {
    const STRUCT_ID = this.creep_id_to_struct_id.get(creep_id);
    if (STRUCT_ID == null) {
      return;
    }
    this.creep_id_to_struct_id.delete(creep_id);
    this.struct_id_to_creep_id.delete(STRUCT_ID);
  }

  public static RemoveStructureIdFromList(
    type: StructureConstant,
    invalid_struct_id: Id<Structure<StructureConstant>>
  ) {
    if (!this.struct_type_to_struct_ids.has(type)) {
      return;
    }
    const ARR = this.struct_type_to_struct_ids.get(type)!;
    const INDEX = ARR.indexOf(invalid_struct_id);
    if (INDEX >= 0) {
      ARR.splice(INDEX, 1);
      if (this.struct_id_to_creep_id.has(invalid_struct_id)) {
        const CREEP_ID = this.struct_id_to_creep_id.get(invalid_struct_id)!;
        this.struct_id_to_creep_id.delete(invalid_struct_id);
        this.creep_id_to_struct_id.delete(CREEP_ID);
      }
    }
  }
}
