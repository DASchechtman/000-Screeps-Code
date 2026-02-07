import { ScreepFile } from "FileSystem/File";
import { EntityBehavior, EntityTypes } from "./BehaviorTypes";
import {
  BuilderIds,
  CreepQueueData,
  GaurdIds,
  HarvestIds,
  QueueData,
  RepairIds,
  TowerSuppliersIds,
  UpgraderIds
} from "./Utils/CreepUtils";
import { Queue } from "utils/Queue";
import { BuildBehavior } from "./BuildBehavior";
import { StringBuilder } from "utils/StringBuilder";

export class SpawnBehavior implements EntityBehavior {
  private static after_spawn_queue = new Queue<() => void>();
  private spawn: StructureSpawn | null = null;
  private spawn_id: string = "";
  private file_path = ["entities", "", "info"];
  private next_creep_name = "";

  private GetCreepName(behavior: EntityTypes, Fn: (b: EntityTypes) => void) {
    let name = ["Creep", Game.time];
    if (behavior === EntityTypes.HARVESTER_TYPE) {
      name[0] = "Harvester";
    } else if (behavior === EntityTypes.UPGRADER_TYPE) {
      name[0] = "Upgrader";
    } else if (behavior === EntityTypes.BUILDER_TYPE) {
      name[0] = "Builder";
    } else if (behavior === EntityTypes.REPAIR_TYPE) {
      name[0] = "Repairer";
    } else if (behavior === EntityTypes.ATTACK_TYPE) {
      name[0] = "Gaurd";
    } else if (behavior === EntityTypes.STRUCTURE_SUPPLIER_TYPE) {
      name[0] = "Tower Supplier";
    }
    return name.join(" - ");
  }

  private FindCreepFromName(name: string) {
    for (let creep_id in Game.creeps) {
      const CREEP = Game.creeps[creep_id];
      if (CREEP.name === name) {
        return CREEP;
      }
    }
    return null;
  }

  private CreateCreepRoleCallback(name: string, GetCreepList: (path: string[], new_vals?: any) => any[]) {
    const LIST = GetCreepList(this.file_path)
    const PENDING_INDEX = LIST.indexOf('queued')
    if (PENDING_INDEX >= 0) {
        LIST[PENDING_INDEX] = 'pending'
    }
    GetCreepList(LIST)

    return () => {
      const CREEP = this.FindCreepFromName(name);
      if (CREEP === null) {
        return;
      }
      const LIST = GetCreepList(this.file_path);

      if (PENDING_INDEX >= 0) {
        LIST[PENDING_INDEX] = CREEP.id
      }

      GetCreepList(this.file_path, LIST);
    };
  }

  Load(file: ScreepFile, id: string) {
    this.spawn_id = id;
    this.spawn = Game.getObjectById(this.spawn_id as Id<StructureSpawn>);
    let found_spawn = this.spawn !== null;
    if (found_spawn) {
      this.file_path[1] = `_${this.spawn!.room.name}`;
    }
    return found_spawn;
  }

  Run() {
    if (this.spawn === null) {
      return;
    }

    const QUEUE = new Queue(QueueData(this.file_path));
    const NEXT_CREEP = QUEUE.Peek();

    if (this.spawn.spawning && this.next_creep_name === "") {
      this.next_creep_name = this.spawn.spawning.name;
    }
    else if (!this.spawn.spawning && SpawnBehavior.after_spawn_queue.Size() > 0) {
      const NEXT = SpawnBehavior.after_spawn_queue.Dequeue()!;
      NEXT();
      this.next_creep_name = "";
    }

    if (NEXT_CREEP == null) {
      return;
    }
    let x = true
    const STR_BUILDER = new StringBuilder(EntityTypes[NEXT_CREEP.creep_type])
    STR_BUILDER.MapFrom(0, str => {
        if (str === '_') {
            x = true
            return ' '
        }
        let ret = x ? str : str.toLocaleLowerCase()
        x = false
        return ret
    })
    const NAME = `${STR_BUILDER} - ${Game.time}`;
    let spawn_ret = this.spawn.spawnCreep(NEXT_CREEP.body, NAME);
    if (spawn_ret === OK) {
      QUEUE.Dequeue();
      let behavior = NEXT_CREEP.creep_type;
      if (behavior === EntityTypes.HARVESTER_TYPE) {
        SpawnBehavior.after_spawn_queue.Enqueue(this.CreateCreepRoleCallback(NAME, HarvestIds));
      } else if (behavior === EntityTypes.UPGRADER_TYPE) {
        SpawnBehavior.after_spawn_queue.Enqueue(this.CreateCreepRoleCallback(NAME, UpgraderIds));
      } else if (behavior === EntityTypes.BUILDER_TYPE) {
        SpawnBehavior.after_spawn_queue.Enqueue(this.CreateCreepRoleCallback(NAME, BuilderIds));
      } else if (behavior === EntityTypes.REPAIR_TYPE) {
        SpawnBehavior.after_spawn_queue.Enqueue(this.CreateCreepRoleCallback(NAME, RepairIds));
      } else if (behavior === EntityTypes.ATTACK_TYPE) {
        SpawnBehavior.after_spawn_queue.Enqueue(this.CreateCreepRoleCallback(NAME, GaurdIds));
      } else if (behavior === EntityTypes.STRUCTURE_SUPPLIER_TYPE) {
        SpawnBehavior.after_spawn_queue.Enqueue(this.CreateCreepRoleCallback(NAME, TowerSuppliersIds));
      }
    }

    QueueData(this.file_path, QUEUE.ToArray());
  }

  Cleanup(file: ScreepFile) {}

  Unload(file: ScreepFile) {}
}
