import { EntityObj } from "./Creep";
import { EntityTypes } from "./CreepBehaviors.ts/BehaviorTypes";
import { RoomData } from "Rooms/RoomData";
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
import { CreepScheduler } from "./CreepScheduler";
import { Timer } from "utils/Timer";

export class CreepObjectManager {
  private static manager: CreepObjectManager | null = null;

  public static GetCreepManager() {
    if (this.manager === null) {
      this.manager = new CreepObjectManager();
    }
    return this.manager;
  }

  private entity: EntityObj;
  private scheduler = new CreepScheduler();
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
  private spawn_ids: string[];
  private all_ids: (() => string[])[];
  private message_callbacks = new Array<() => any>();

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
    this.spawn_ids = [];
    this.all_ids = [];
  }

  private RunEntityCode(
    behavior: number,
    id_arr: string[],
    OverWrite: (path: string[], new_vals?: string[]) => string[]
  ) {
    for (let i = 0; i < id_arr.length; i++) {
      let id = id_arr[i];
      if ([this.filler_data, this.queued_data, "pending"].includes(id)) {
        continue;
      }

      this.entity.FullyOverrideCreep(id, behavior);

      this.entity.Load(failed_id => {
        console.log(`unloading - ${failed_id}`);
        id_arr[i] = this.filler_data;
        OverWrite(this.file_path, id_arr);
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
        EXTENSION_OBJS.reduce((prev, cur) => {
          if (cur.store == null) {
            return 0;
          }
          return prev + cur.store.getUsedCapacity(RESOURCE_ENERGY);
        }, 0);
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

  private HandleSpawnMessage(message: any) {

  }

  public LoadEntityData(room_name: string) {
    this.room_name = room_name;
    this.file_path = ["entities", `_${room_name}`, "info"];
    this.ReadCreepDataFromFile();
  }

  public RunAllActiveEntities() {
    this.GiveEntitiesOrders();
    this.RunEntityCode(EntityTypes.SPAWN_TYPE, this.spawn_ids, SpawnIds);
    this.RunEntityCode(EntityTypes.HARVESTER_TYPE, this.harvester_ids, HarvestIds);
    this.RunEntityCode(EntityTypes.UPGRADER_TYPE, this.upgrader_ids, UpgraderIds);
    this.RunEntityCode(EntityTypes.REPAIR_TYPE, this.repair_ids, RepairIds);
    this.RunEntityCode(EntityTypes.BUILDER_TYPE, this.builder_ids, BuilderIds);
    this.RunEntityCode(EntityTypes.ATTACK_TYPE, this.gaurd_ids, GaurdIds);
    this.RunEntityCode(EntityTypes.STRUCTURE_SUPPLIER_TYPE, this.tower_supplier_ids, TowerSuppliersIds);
    this.RunEntityCode(EntityTypes.TOWER_TYPE, this.tower_ids, TowerIds);
    this.ReadMessageCallbacks();
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
    QueueData(
        this.file_path,
        this.scheduler.GetCreepsToSpawn((body, energy_limit) => this.GetCreepBody(body, energy_limit))
      );

  }

  public GiveEntitiesOrders() {
    const QUEUE = QueueData(this.file_path);
    if (QUEUE.length > 0) {
      const NEXT = QUEUE.at(0)!

      for (let id of this.spawn_ids) {
        this.entity.FullyOverrideCreep(id, EntityTypes.SPAWN_TYPE);
        const RES = this.entity.GiveOrder({
          creep_type: NEXT.creep_type,
          body: NEXT.body,
          order_type: "spawn"
        });

        if (RES) {
          this.message_callbacks.push(RES);
        }
      }
    }
  }

  public ReadMessageCallbacks() {
    for (let fn of this.message_callbacks) {
      const RES = fn();
      const FROM = RES.type as EntityTypes | undefined;
      if (FROM === EntityTypes.SPAWN_TYPE) {
        //this.HandleSpawnMessage(RES);
      } else if (FROM === EntityTypes.HARVESTER_TYPE) {
        // to be completed later
      } else if (FROM === EntityTypes.BUILDER_TYPE) {
        // to be completed later
      } else if (FROM === EntityTypes.REPAIR_TYPE) {
        // to be completed later
      } else if (FROM === EntityTypes.ATTACK_TYPE) {
        // to be completed later
      } else if (FROM === EntityTypes.STRUCTURE_SUPPLIER_TYPE) {
        // to be completed later
      } else if (FROM === EntityTypes.TOWER_TYPE) {
        // to be completed later
      } else if (FROM === EntityTypes.UPGRADER_TYPE) {
        // to be completed later
      }
    }
    this.message_callbacks.clear();
  }

  public SaveCreepData() {
    TowerIds(this.file_path, this.tower_ids);
    SpawnIds(this.file_path, this.spawn_ids);
  }
}
