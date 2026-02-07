import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { MinHeap } from "utils/Heap";
import { EntityTypes } from "../BehaviorTypes";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";

export type CreepQueueData = { body: BodyPartConstant[], limit: number | null, creep_type: EntityTypes }

export function GetContainerIdIfThereIsEnoughStoredEnergy(creep: Creep) {
  const CONTAINERS = RoomData.GetRoomData()
    .GetRoomStructures(STRUCTURE_CONTAINER)
    .map(id => Game.getObjectById(id))
    .filter(s => {
      const HAS_ENOUGH_ENERGY = s != null && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
      return HAS_ENOUGH_ENERGY;
    })
    .sort((a, b) => {
      const CONTAINER_1 = a as StructureContainer;
      const CONTAINER_2 = b as StructureContainer;

      return CONTAINER_1.store.getUsedCapacity(RESOURCE_ENERGY) - CONTAINER_2.store.getUsedCapacity(RESOURCE_ENERGY);
    });

  if (CONTAINERS.length > 0) {
    return CONTAINERS.at(-1)!.id;
  }

  return "N/A";
}

export function FlipStateBasedOnEnergyInCreep(creep: Creep, state: boolean) {
  const ENERGY_FULL = creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
  const ENERGY_EMPTY = creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;

  if (ENERGY_FULL) {
    return true;
  } else if (ENERGY_EMPTY) {
    return false;
  }

  return state;
}

export function GetEnergy(
  creep: Creep,
  source1: Source,
  source2: Source | undefined | null,
  container: StructureContainer | null
) {
  if (container && creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(container, { maxRooms: 1 });
  } else {
    let ret = creep.harvest(source1);
    if (ret === ERR_NOT_ENOUGH_ENERGY && source2) {
      ret = creep.harvest(source2);
      if (ret === ERR_NOT_IN_RANGE) {
        creep.moveTo(source2, { maxRooms: 1 });
      }
    } else if (ret === ERR_NOT_IN_RANGE) {
      creep.moveTo(source1, { maxRooms: 1 });
    }
  }
}

export function SortStructs(a: Structure<StructureConstant> | null, b: Structure<StructureConstant> | null) {
  const DECAYING_STRUCT_TYPES: StructureConstant[] = [STRUCTURE_CONTAINER, STRUCTURE_RAMPART, STRUCTURE_ROAD];

  const GetStructValue = (struct: Structure<StructureConstant>) => {
    return struct.hits / struct.hitsMax;
  };

  const GetCompareVal = (a: Structure<StructureConstant>, b: Structure<StructureConstant>) => {
    return GetStructValue(a) - GetStructValue(b);
  };

  if (a == null || b == null) {
    return 0;
  }

  const DECAYING_STRUCT_LOW_ON_HEALTH = DECAYING_STRUCT_TYPES.includes(a.structureType) && GetStructValue(a) <= 0.15;

  const BOTH_STRUCTS_ARE_DECAYING =
    DECAYING_STRUCT_TYPES.includes(a.structureType) && DECAYING_STRUCT_TYPES.includes(b.structureType);

  if (a.structureType === STRUCTURE_RAMPART && a.hits < 15000) {
    return -1;
  }
  if (DECAYING_STRUCT_LOW_ON_HEALTH) {
    return -1;
  } else if (BOTH_STRUCTS_ARE_DECAYING) {
    if (a.structureType === STRUCTURE_RAMPART && GetStructValue(a) < 0.2) {
      return a.structureType === b.structureType ? GetCompareVal(a, b) : -1;
    } else if (a.structureType === STRUCTURE_CONTAINER && GetStructValue(a) < 0.5) {
      return a.structureType === b.structureType ? GetCompareVal(a, b) : -1;
    }

    return GetCompareVal(a, b);
  }

  return GetCompareVal(a, b);
}

export function GetDamagedStruct(): Structure | null {
  const ALL_STRUCTS = [
    ...RoomData.GetRoomData().GetOwnedStructureIds(),
    ...RoomData.GetRoomData().GetRoomStructures([STRUCTURE_CONTAINER, STRUCTURE_ROAD, STRUCTURE_WALL])
  ];

  let Id = new MinHeap(ALL_STRUCTS, struct => {
    let s = Game.getObjectById(struct);
    if (s == null) {
      return 10000000000;
    }

    let health = s.hits / s.hitsMax;
    if (s.structureType === STRUCTURE_RAMPART && health <= 0.07) {
      return -1000 + health;
    } else if (s.structureType === STRUCTURE_ROAD && health <= 0.35) {
      return -1000 + health;
    } else if (s.structureType === STRUCTURE_CONTAINER && health <= 0.2) {
      return -1000 + health;
    }

    return health;
  }).Peek();

  const obj = Game.getObjectById(Id)
  return obj;
}

export function CreateConstructionSite(creep: Creep) {
  const ROOM = creep.room;
  const CONSTRUCTION_SITES = [
    ...ROOM.lookForAt(LOOK_STRUCTURES, creep.pos),
    ...ROOM.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos)
  ];

  let found_road = CONSTRUCTION_SITES.some(s => {
    return s.structureType === STRUCTURE_ROAD;
  });

  if (!found_road) {
    ROOM.createConstructionSite(creep.pos, STRUCTURE_ROAD);
  }
}

export function HarvestIds(path: string[], new_ids?: string[]): string[] {
  const FILE = FileSystem.GetFileSystem().GetFile(path);
  if (new_ids) {
    FILE.WriteToFile(EntityTypes.HARVESTER_TYPE, new_ids);
    return [];
  } else {
    return SafeReadFromFileWithOverwrite(FILE, EntityTypes.HARVESTER_TYPE, new Array<string>());
  }
}

export function UpgraderIds(path: string[], new_ids?: string[]): string[] {
  const FILE = FileSystem.GetFileSystem().GetFile(path);
  if (new_ids) {
    FILE.WriteToFile(EntityTypes.UPGRADER_TYPE, new_ids);
    return [];
  } else {
    return SafeReadFromFileWithOverwrite(FILE, EntityTypes.UPGRADER_TYPE, new Array<string>());
  }
}

export function BuilderIds(path: string[], new_ids?: string[]): string[] {
  const FILE = FileSystem.GetFileSystem().GetFile(path);
  if (new_ids) {
    FILE.WriteToFile(EntityTypes.BUILDER_TYPE, new_ids);
    return [];
  } else {
    return SafeReadFromFileWithOverwrite(FILE, EntityTypes.BUILDER_TYPE, new Array<string>());
  }
}

export function RepairIds(path: string[], new_ids?: string[]): string[] {
  const FILE = FileSystem.GetFileSystem().GetFile(path);
  if (new_ids) {
    FILE.WriteToFile(EntityTypes.REPAIR_TYPE, new_ids);
    return [];
  } else {
    return SafeReadFromFileWithOverwrite(FILE, EntityTypes.REPAIR_TYPE, new Array<string>());
  }
}

export function GaurdIds(path: string[], new_ids?: string[]): string[] {
  const FILE = FileSystem.GetFileSystem().GetFile(path);
  if (new_ids) {
    FILE.WriteToFile(EntityTypes.ATTACK_TYPE, new_ids);
    return [];
  } else {
    return SafeReadFromFileWithOverwrite(FILE, EntityTypes.ATTACK_TYPE, new Array<string>());
  }
}

export function TowerSuppliersIds(path: string[], new_ids?: string[]): string[] {
  const FILE = FileSystem.GetFileSystem().GetFile(path);
  if (new_ids) {
    FILE.WriteToFile(EntityTypes.STRUCTURE_SUPPLIER_TYPE, new_ids);
    return [];
  } else {
    return SafeReadFromFileWithOverwrite(FILE, EntityTypes.STRUCTURE_SUPPLIER_TYPE, new Array<string>());
  }
}

export function TowerIds(path: string[], new_ids?: string[]): string[] {
  const FILE = FileSystem.GetFileSystem().GetFile(path);

  if (new_ids) {
    FILE.WriteToFile(EntityTypes.TOWER_TYPE, new_ids);
    return [];
  } else {
    return SafeReadFromFileWithOverwrite(FILE, EntityTypes.TOWER_TYPE, new Array<string>());
  }
}

export function QueueData(path: string[], new_queue?: Array<CreepQueueData>): Array<CreepQueueData> {
  const FILE = FileSystem.GetFileSystem().GetFile(path);
  if (new_queue) {
    FILE.WriteToFile("body_queue", new_queue);
    return [];
  } else {
    return SafeReadFromFileWithOverwrite(FILE, "body_queue", new Array<CreepQueueData>());
  }
}

export function SpawnIds(path: string[], new_ids?: string[]): string[] {
  const FILE = FileSystem.GetFileSystem().GetFile(path)
  if (new_ids) {
    FILE.WriteToFile(EntityTypes.SPAWN_TYPE, new_ids)
    return []
  }
  else {
    return SafeReadFromFileWithOverwrite(FILE, EntityTypes.SPAWN_TYPE, new Array<string>())
  }
}
