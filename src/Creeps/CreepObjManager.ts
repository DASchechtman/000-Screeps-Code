import { EntityObj } from "./Creep";
import { EntityTypes } from "./CreepBehaviors.ts/BehaviorTypes";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { Json } from "Consts";
import {
  BuilderIds,
  CreepQueueData,
  GaurdIds,
  HarvestIds,
  QueueData,
  RepairIds,
  SpawnIds,
  TowerIds,
  TowerSuppliersIds,
  UpgraderIds
} from "./CreepBehaviors.ts/Utils/CreepUtils";

type DataObj = { [key: number | string]: Json };

export class CreepObjectManager {
  private static manager: CreepObjectManager | null = null;

  public static GetCreepManager() {
    if (this.manager === null) {
      this.manager = new CreepObjectManager();
    }
    return this.manager;
  }

  private entity: EntityObj;
  private filler_data: string;
  private queued_data: string;
  private file_path: string[];
  private room_name: string;

  private harvester_ids: string[];
  private upgrader_ids: string[];
  private builder_ids: string[];
  private repair_ids: string[];
  private gaurd_ids: string[];
  private tower_ids: string[];
  private tower_supplier_ids: string[];
  private creep_queue: CreepQueueData[];
  private spawn_ids: string[];
  private all_ids: (() => string[])[];

  private constructor() {
    this.entity = new EntityObj();
    this.file_path = [];
    this.room_name = "";
    this.filler_data = "empty";
    this.queued_data = "queued";

    this.harvester_ids = [];
    this.upgrader_ids = [];
    this.builder_ids = [];
    this.repair_ids = [];
    this.gaurd_ids = [];
    this.tower_ids = [];
    this.tower_supplier_ids = [];
    this.creep_queue = [];
    this.spawn_ids = [];
    this.all_ids = [];
  }

  private RunEntityCode(behavior: number, id_arr: string[], OverWrite: (path: string[], new_vals?: string[]) => string[]) {
    for (let i = 0; i < id_arr.length; i++) {
      let id = id_arr[i];
      if ([this.filler_data, this.queued_data, 'pending'].includes(id)) {
        continue;
      }

      this.entity.FullyOverrideCreep(id, behavior);

      this.entity.Load(failed_id => {
        console.log(`unloading - ${failed_id}`);
        id_arr[i] = this.filler_data;
        OverWrite(this.file_path, id_arr)
      });
      this.entity.Run();
      this.entity.Cleanup();
    }
  }

  private ReadCreepDataFromFile() {
    this.harvester_ids = HarvestIds(this.file_path);
    this.upgrader_ids = UpgraderIds(this.file_path);
    this.builder_ids = BuilderIds(this.file_path);
    this.repair_ids = RepairIds(this.file_path);
    this.gaurd_ids = GaurdIds(this.file_path);
    this.tower_supplier_ids = TowerSuppliersIds(this.file_path);
    this.tower_ids = TowerIds(this.file_path);
    this.spawn_ids = SpawnIds(this.file_path);

    this.all_ids = [];
    this.all_ids[EntityTypes.HARVESTER_TYPE] = () => this.harvester_ids;
    this.all_ids[EntityTypes.UPGRADER_TYPE] = () => this.upgrader_ids;
    this.all_ids[EntityTypes.BUILDER_TYPE] = () => this.builder_ids;
    this.all_ids[EntityTypes.REPAIR_TYPE] = () => this.repair_ids;
    this.all_ids[EntityTypes.ATTACK_TYPE] = () => this.gaurd_ids;
    this.all_ids[EntityTypes.TOWER_TYPE] = () => this.tower_ids;
    this.all_ids[EntityTypes.STRUCTURE_SUPPLIER_TYPE] = () => this.tower_supplier_ids;
    this.all_ids[EntityTypes.SPAWN_TYPE] = () => this.spawn_ids;
  }

  private GetCreepBody(body: BodyPartConstant[], energy_limit: number | null) {
    const EXTENSIONS = RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_EXTENSION);
    const SPAWNS = RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_SPAWN);
    const BODY_TO_ENERGY_MAP = new Map<BodyPartConstant, number>([
      [MOVE, 50],
      [WORK, 100],
      [CARRY, 50],
      [ATTACK, 80],
      [RANGED_ATTACK, 150],
      [HEAL, 250],
      [CLAIM, 600],
      [TOUGH, 10]
    ]);

    let max_energy = 300 * SPAWNS.length;
    let controller = Game.rooms[this.room_name]?.controller;

    const CANT_ACCESS_MORE_ENERGY = this.harvester_ids.filter(x => x !== this.filler_data).length === 0;
    //const CANT_ACCESS_MORE_ENERGY = false
    if (controller) {
      if (controller.level >= 2 && controller.level <= 6) {
        max_energy += 50 * EXTENSIONS.length;
      } else if (controller.level === 7) {
        max_energy += 100 * EXTENSIONS.length;
      } else if (controller.level === 8) {
        max_energy += 200 * EXTENSIONS.length;
      }
    }

    if (CANT_ACCESS_MORE_ENERGY) {
      const EXTENSION_OBJS = EXTENSIONS.map(id => Game.getObjectById(id)).filter(
        s => s != null
      ) as StructureExtension[];
      max_energy =
        300 * SPAWNS.length +
        EXTENSION_OBJS.reduce((prev, cur) => prev + cur.store.getUsedCapacity(RESOURCE_ENERGY), 0);
    }

    const BuildBody = (parts: BodyPartConstant[], energy_limit: number | undefined | null) => {
      if (energy_limit == null || energy_limit > max_energy) {
        energy_limit = max_energy;
      }

      let total_energy = 0;
      let i = 0;
      let new_body = new Array<BodyPartConstant>();

      while (new_body.length < 50) {
        let si = i % parts.length;
        let energy_needed = BODY_TO_ENERGY_MAP.get(parts[si])!;
        if (energy_needed + total_energy > energy_limit) {
          break;
        }

        total_energy += energy_needed;
        new_body.push(parts[si]);
        i++;
      }

      return new_body;
    };

    return BuildBody(body, energy_limit);
  }

  public LoadEntityData(room_name: string) {
    this.room_name = room_name;
    this.file_path = ["entities", `_${room_name}`, "info"];
    this.ReadCreepDataFromFile();
  }

  public RunAllActiveEntities() {
    this.RunEntityCode(EntityTypes.SPAWN_TYPE, this.spawn_ids, SpawnIds);
    this.RunEntityCode(EntityTypes.HARVESTER_TYPE, this.harvester_ids, HarvestIds);
    this.RunEntityCode(EntityTypes.UPGRADER_TYPE, this.upgrader_ids, UpgraderIds);
    this.RunEntityCode(EntityTypes.REPAIR_TYPE, this.repair_ids, RepairIds);
    this.RunEntityCode(EntityTypes.BUILDER_TYPE, this.builder_ids, BuilderIds);
    this.RunEntityCode(EntityTypes.ATTACK_TYPE, this.gaurd_ids, GaurdIds);
    this.RunEntityCode(EntityTypes.STRUCTURE_SUPPLIER_TYPE, this.tower_supplier_ids, TowerSuppliersIds);
    this.RunEntityCode(EntityTypes.TOWER_TYPE, this.tower_ids, TowerIds);
  }

  public AddStructureId(id: Id<Structure<StructureConstant>>) {
    if (this.all_ids.some(arr => arr().includes(id))) {
      return;
    }

    const STRUCT = Game.getObjectById(id);

    if (STRUCT?.structureType === STRUCTURE_TOWER) {
      this.tower_ids.push(id);
    } else if (STRUCT?.structureType === STRUCTURE_SPAWN) {
      this.spawn_ids.push(id);
    }
  }

  public QueueNextSpawnBody() {
    const QUEUE = QueueData(this.file_path);
    const MY_TOWERS = RoomData.GetRoomData().GetOwnedStructureIds(STRUCTURE_TOWER);
    const CONSTRUCTION_SITE = RoomData.GetRoomData().GetConstructionSites();
    const CONTAINERS = RoomData.GetRoomData().GetRoomStructures(STRUCTURE_CONTAINER);
    const ENERGY_LIMIT = 1200;
    const HAS_THINGS_TO_BUILD = CONSTRUCTION_SITE.length > 0;
    const NO_HARVESTERS_ACTIVE = this.harvester_ids.every(x => x === this.filler_data || x === this.queued_data);
    const NO_SUPPLIERS_ACTIVE = this.tower_supplier_ids.every(x => x === this.filler_data || x === this.queued_data);
    const CONTAINERS_EXIST = CONTAINERS.length > 0;
    const ENEMIES_EXIST = RoomData.GetRoomData().GetAllEnemyCreepIds().length > 0;

    const FillArrayWithPlaceHolders = (arr: string[], max: number, fn: () => void) => {
      const END = Math.min(max, 6);
      if (max < 1) {
        fn();
        arr[0] = this.queued_data;
        return;
      }

      for (let i = 0; i < END; i++) {
        while (i >= arr.length) {
          arr.push(this.filler_data);
        }
        const SPOT = arr[i];
        if (SPOT === this.filler_data) {
          fn();
          arr[i] = this.queued_data;
        }
      }
    };

    const GetEmergencyCreepMax = (behavior: EntityTypes, limit: number, emergency_max: number) => {
      const NEXT_IN_QUEUE = QUEUE.at(0);
      if (NEXT_IN_QUEUE == null) {
        return emergency_max;
      }
      if (NEXT_IN_QUEUE.creep_type !== behavior || NEXT_IN_QUEUE.limit !== limit) {
        return -1;
      }
      return emergency_max;
    };

    if (NO_HARVESTERS_ACTIVE) {
      let max = GetEmergencyCreepMax(EntityTypes.HARVESTER_TYPE, 300, 1);
      console.log(max)
      FillArrayWithPlaceHolders(this.harvester_ids, max, () => {
        QUEUE.unshift({ body: [MOVE, CARRY, WORK], limit: 300, creep_type: EntityTypes.HARVESTER_TYPE });
        console.log("adding to queue");
      });
    }
    else if (NO_SUPPLIERS_ACTIVE && CONTAINERS_EXIST) {
      let max = GetEmergencyCreepMax(EntityTypes.STRUCTURE_SUPPLIER_TYPE, 300, 1);
      console.log("queuing emergency creep");
      FillArrayWithPlaceHolders(this.tower_supplier_ids, max, () => {
        QUEUE.unshift({
          body: [MOVE, MOVE, CARRY, CARRY, CARRY],
          limit: 300,
          creep_type: EntityTypes.STRUCTURE_SUPPLIER_TYPE
        });
      });
    }

    FillArrayWithPlaceHolders(this.gaurd_ids, 3, () => {
      QUEUE.push({ body: [MOVE, ATTACK, TOUGH, TOUGH, TOUGH], limit: null, creep_type: EntityTypes.ATTACK_TYPE });
    });

    if (CONTAINERS_EXIST) {
      const MAX = MY_TOWERS.length === 0 ? 1 : MY_TOWERS.length;
      FillArrayWithPlaceHolders(this.tower_supplier_ids, 2, () => {
        QUEUE.push({
          body: [MOVE, MOVE, CARRY, CARRY, CARRY],
          limit: 800,
          creep_type: EntityTypes.STRUCTURE_SUPPLIER_TYPE
        });
      });
    }

    const NUM_OF_HARVESTERS = CONTAINERS.length === 0 ? 2 : CONTAINERS.length;
    FillArrayWithPlaceHolders(this.harvester_ids, NUM_OF_HARVESTERS, () => {
      let max_energy = ENERGY_LIMIT;
      let body: BodyPartConstant[] = [MOVE, WORK, CARRY, MOVE, WORK];
      if (CONTAINERS_EXIST) {
        body = [MOVE, CARRY, WORK, WORK, WORK];
        max_energy = 800;
      }
      QUEUE.push({ body: body, limit: max_energy, creep_type: EntityTypes.HARVESTER_TYPE });
    });

    const NUM_OF_UPGRADERS = ENEMIES_EXIST ? 0 : 2;
    FillArrayWithPlaceHolders(this.upgrader_ids, NUM_OF_UPGRADERS, () => {
      QUEUE.push({ body: [WORK, CARRY, MOVE], limit: 800, creep_type: EntityTypes.UPGRADER_TYPE });
    });

    if (HAS_THINGS_TO_BUILD) {
      FillArrayWithPlaceHolders(this.builder_ids, 1, () => {
        QUEUE.push({
          body: [MOVE, WORK, CARRY, WORK, CARRY],
          limit: ENERGY_LIMIT,
          creep_type: EntityTypes.BUILDER_TYPE
        });
      });
    }

    if (!CONTAINERS_EXIST) {
      FillArrayWithPlaceHolders(this.repair_ids, 1, () => {
        QUEUE.push({
          body: [WORK, CARRY, MOVE, MOVE, MOVE, CARRY],
          limit: ENERGY_LIMIT,
          creep_type: EntityTypes.REPAIR_TYPE
        });
      });
    }

    QueueData(
      this.file_path,
      QUEUE.map(x => ({ ...x, body: this.GetCreepBody(x.body, x.limit) }))
    );
  }

  public SaveCreepData() {
    TowerIds(this.file_path, this.tower_ids);
    SpawnIds(this.file_path, this.spawn_ids);
  }
}
