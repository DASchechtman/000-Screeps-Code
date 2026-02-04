import { ScreepFile } from "FileSystem/File";
import { EntityBehavior, EntityState, EntityStateManager } from "./BehaviorTypes";
import { JsonObj } from "Consts";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { TowerBehavior } from "./TowerBehavior";
import {
  FlipStateBasedOnEnergyInCreep,
  GetContainerIdIfThereIsEnoughStoredEnergy,
  GetEnergy
} from "./Utils/CreepUtils";
import { Timer } from "utils/Timer";
import { RoomData } from "Rooms/RoomData";
import { BuildingAllocator } from "utils/BuildingAllocator";

type StorageStruct = StructureSpawn | StructureExtension | StructureTower | null;

function SortStructs(a: StorageStruct, b: StorageStruct) {
  if (a == null || b == null) {
    return 0;
  }

  const HIGH_PRIO_STRUCTS = new Array<StructureConstant>();
  HIGH_PRIO_STRUCTS.push(STRUCTURE_SPAWN, STRUCTURE_EXTENSION);

  if (a.structureType === STRUCTURE_SPAWN) {
    return -1;
  } else if (a.structureType === STRUCTURE_TOWER && HIGH_PRIO_STRUCTS.includes(b.structureType)) {
    return 1;
  } else if (a.structureType === STRUCTURE_EXTENSION && b.structureType === STRUCTURE_TOWER) {
    return -1;
  }

  return 0;
}

const SORTED_EXTENSION_KEY = "ordered extension ids";

class CreepState {
  protected creep_id: Id<Creep>;
  protected creep: Creep | null;

  constructor(id: Id<Creep>) {
    this.creep_id = id;
    this.creep = null;
  }

  protected GetCreep() {
    this.creep = Game.getObjectById(this.creep_id);
    return this.creep;
  }
}

class HarvestEnergyState extends CreepState implements EntityState {
  constructor(id: Id<Creep>) {
    super(id);
  }

  RunState() {
    if (this.GetCreep() === null) {
      return false;
    }
    const CREEP = this.creep!;

    const CONTAINER_ID = GetContainerIdIfThereIsEnoughStoredEnergy(CREEP);
    if (CONTAINER_ID === "N/A") {
      return true;
    }

    const CONTAINER = Game.getObjectById(CONTAINER_ID);
    if (CONTAINER == null) {
      return true;
    }

    if (CREEP.withdraw(CONTAINER, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      CREEP.moveTo(CONTAINER);
    }

    return true;
  }

  GetNextState(): EntityState {
    const SPAWN_CONTAINERS = RoomData.GetRoomData()
      .GetOwnedStructureIds(STRUCTURE_SPAWN, STRUCTURE_EXTENSION)
      .map(id => Game.getObjectById(id))
      .filter(s => s != null && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    const ENERGY_FILLED = this.creep!.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

    if (ENERGY_FILLED) {
      if (SPAWN_CONTAINERS.length > 0) {
        return new SupplySpawnAndExtensionsState(this.creep_id);
      } else {
        return new SupplyStorageState(this.creep_id);
      }
    }

    return this;
  }
}

class SupplySpawnAndExtensionsState extends CreepState implements EntityState {
  private structs_to_supply: Array<StructureSpawn | StructureExtension>;
  private index: number;
  constructor(id: Id<Creep>) {
    super(id);
    this.structs_to_supply = []
    this.index = 0;
  }

  RunState(file: ScreepFile) {
    if (this.GetCreep() === null) {
      return false;
    }
    const CREEP = this.creep!;
    const EXTENSIONS = SafeReadFromFileWithOverwrite(
      file,
      SORTED_EXTENSION_KEY,
      new Array<Id<StructureExtension>>()
    );
    const SPAWNS = RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_SPAWN);
    const FilterFn = (s: StructureSpawn | StructureExtension | null) => {
      return s != null && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    };

    this.structs_to_supply = [
      ...(SPAWNS.map(id => Game.getObjectById(id)).filter(FilterFn) as StructureSpawn[]),
      ...(EXTENSIONS.map(id => Game.getObjectById(id)).filter(FilterFn) as StructureExtension[])
    ];

    const STRUCT = this.structs_to_supply.at(this.index);
    if (!STRUCT) {
      return true;
    }

    let ret = CREEP.transfer(STRUCT, RESOURCE_ENERGY);
    if (ret === ERR_NOT_IN_RANGE) {
      CREEP.moveTo(STRUCT);
    } else if (ret === ERR_FULL) {
      this.index++;
    }

    return true;
  }

  GetNextState() {
    const CREEP = this.creep!;
    const EMPTY = CREEP.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    if (this.index >= this.structs_to_supply.length) {
      if (EMPTY) {
        return new HarvestEnergyState(this.creep_id);
      } else {
        return new SupplyStorageState(this.creep_id);
      }
    }

    if (EMPTY) {
      return new HarvestEnergyState(this.creep_id);
    }

    return this;
  }
}

class SupplyStorageState extends CreepState implements EntityState {
  private storage: Array<StructureStorage | null>;
  private supplied: boolean;
  constructor(id: Id<Creep>) {
    super(id);
    this.storage = RoomData.GetRoomData()
      .GetOwnedStructureIds(STRUCTURE_STORAGE)
      .map(id => Game.getObjectById(id));
    this.supplied = false;
  }

  RunState() {
    if (this.GetCreep() === null) {
      return false;
    }
    const CREEP = this.creep!;
    const STORAGE = this.storage.at(0);

    if (STORAGE == null) {
      this.supplied = true
      return true;
    }
    else if (STORAGE.store.getUsedCapacity(RESOURCE_ENERGY) >= 300000) {
        this.supplied = true
        return true
    }

    let ret = CREEP.transfer(STORAGE, RESOURCE_ENERGY, 75);
    const SupplyStorage = (code: ScreepsReturnCode) => {
      if (code === ERR_NOT_IN_RANGE) {
        CREEP.moveTo(STORAGE);
      } else if (code === ERR_NOT_ENOUGH_RESOURCES) {
        code = CREEP.transfer(STORAGE, RESOURCE_ENERGY);
        SupplyStorage(code);
      } else if (code === OK) {
        this.supplied = true;
      }
    };
    SupplyStorage(ret);

    return true;
  }

  GetNextState() {
    const CREEP = this.creep!;
    const EMPTY = CREEP.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    const SPAWN_CONTAINERS = RoomData.GetRoomData()
      .GetOwnedStructureIds(STRUCTURE_SPAWN, STRUCTURE_EXTENSION)
      .map(id => Game.getObjectById(id))
      .filter(s => s != null && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0);

    if (EMPTY) {
      return new HarvestEnergyState(this.creep_id);
    } else if (SPAWN_CONTAINERS.length > 0) {
      return new SupplySpawnAndExtensionsState(this.creep_id)
    } else if (this.supplied) {
      return new SupplyTowerState(this.creep_id);
    }

    return this;
  }
}

class SupplyTowerState extends CreepState implements EntityState {
  constructor(id: Id<Creep>) {
    super(id);
  }

  RunState() {
    let creep: Creep | null = null
    if ((creep = this.GetCreep()) === null) { return false }
    const TOWER = RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_TOWER)
      .map(id => Game.getObjectById(id))
      .filter(s => s != null && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      .at(0)

    if (TOWER == null) { return true }

    let ret = creep.transfer(TOWER, RESOURCE_ENERGY)
    if (ret === ERR_NOT_IN_RANGE) {
        creep.moveTo(TOWER)
    }

    return true;
  }

  GetNextState() {
    const CREEP = this.creep!;
    const EMPTY = CREEP.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    const SPAWN_CONTAINERS = RoomData.GetRoomData()
      .GetOwnedStructureIds(STRUCTURE_SPAWN, STRUCTURE_EXTENSION)
      .map(id => Game.getObjectById(id))
      .filter(s => s != null && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0);

    if (EMPTY) {
      return new HarvestEnergyState(this.creep_id)
    } else if (SPAWN_CONTAINERS.length > 0) {
      return new SupplySpawnAndExtensionsState(this.creep_id)
    }

    return this;
  }
}

export class StructureSupplierBehavior implements EntityBehavior {
  private static state_manager_map = new Map<Id<Creep>, EntityStateManager>()
  private static GetStateManager(id: Id<Creep>) {
    if (!this.state_manager_map.has(id)) {
        this.state_manager_map.set(id, new EntityStateManager(new HarvestEnergyState(id)))
    }
    return this.state_manager_map.get(id)!
  }

  private static RemoveStateManager(id: Id<Creep>) {
    this.state_manager_map.delete(id)
  }


  private creep: Creep | null;
  private source: Source | null;
  private tower_id_key: string;
  private state_key: string;
  private energy_source_key: string;
  private data: JsonObj;
  private id: string;
  private num_of_extensions_key: string;
  private file: ScreepFile | null

  constructor() {
    this.creep = null;
    this.source = null;
    this.tower_id_key = "tower to supply";
    this.state_key = "state";
    this.energy_source_key = "from container";
    this.data = {};
    this.id = "";
    this.num_of_extensions_key = "num of extension";
    this.file = null
  }

  Load(file: ScreepFile, id: string) {
    this.creep = Game.getObjectById(id as Id<Creep>);
    this.id = id;
    let harvest_state: boolean = SafeReadFromFileWithOverwrite(file, this.state_key, false);
    let tower_id: string = SafeReadFromFileWithOverwrite(file, this.tower_id_key, "null");
    let energy_source: string = SafeReadFromFileWithOverwrite(file, this.energy_source_key, "null");
    let extension_id_list: Array<Id<StructureExtension>> = SafeReadFromFileWithOverwrite(
      file,
      SORTED_EXTENSION_KEY,
      []
    );
    this.file = file
    let num_of_extensions: number = RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_EXTENSION).length;
    const HAS_CREEP = this.creep != null;

    if (extension_id_list.length === 0 || num_of_extensions !== extension_id_list.length) {
      const EXTENSION_IDS = RoomData.GetRoomData()
        .GetRoomStructures(STRUCTURE_EXTENSION)
        .map(id => Game.getObjectById(id))
        .sort((a, b) => {
          if (a == null || b == null) {
            return 0;
          }
          const Distance = (pos: RoomPosition) => {
            return Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
          };

          return Distance(b.pos) - Distance(a.pos);
        });
      extension_id_list = EXTENSION_IDS.map(s => s?.id).filter(s => s != null) as Id<StructureExtension>[];
      num_of_extensions = extension_id_list.length;
    }

    if (this.creep && !this.source) {
      this.source = this.creep.room.find(FIND_SOURCES)[1];
    }

    if (tower_id === "null") {
      const TOWER_ID = TowerBehavior.GetTowerId(id);
      if (TOWER_ID != null) {
        tower_id = TOWER_ID;
      }
    }

    const TIMER = new Timer(id);
    TIMER.StartTimer(15);

    if (energy_source === "null" || TIMER.IsTimerDone()) {
      if (!HAS_CREEP) {
        return false;
      }
      energy_source = GetContainerIdIfThereIsEnoughStoredEnergy(this.creep!);
      if (energy_source === "null") {
        energy_source = "N/A";
      }
    }

    this.data[this.state_key] = harvest_state;
    this.data[this.tower_id_key] = tower_id;
    this.data[this.energy_source_key] = energy_source;
    this.data[SORTED_EXTENSION_KEY] = extension_id_list;
    this.data[this.num_of_extensions_key] = num_of_extensions;

    return HAS_CREEP;
  }

  Run() {
    const MANAGER = StructureSupplierBehavior.GetStateManager(this.id as Id<Creep>)
    if(MANAGER.RunState(this.file!)) { MANAGER.GetNextState() }
  }

  Cleanup(file: ScreepFile) {
    file.WriteAllToFile([
      { key: this.state_key, value: this.data[this.state_key] },
      { key: this.tower_id_key, value: this.data[this.tower_id_key] },
      { key: this.energy_source_key, value: this.data[this.energy_source_key] },
      { key: SORTED_EXTENSION_KEY, value: this.data[SORTED_EXTENSION_KEY] },
      { key: this.num_of_extensions_key, value: this.data[this.num_of_extensions_key] }
    ]);
  }

  Unload(file: ScreepFile) {
    TowerBehavior.RemoveTowerId(this.id);
    StructureSupplierBehavior.RemoveStateManager(this.id as Id<Creep>)
  }
}
