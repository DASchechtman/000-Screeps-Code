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
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";

export class SpawnBehavior implements EntityBehavior {
  private static after_spawn_queue = new Queue<() => void>();
  private spawn: StructureSpawn | null = null;
  private spawn_id: string = "";
  private file_path = ["entities", "", "info"];
  private next_creep_name = "";
  private queued_roles = new Array<{creep_name: string, role: EntityTypes}>()
  private queued_roles_key = "roles"

  private FindCreepFromName(name: string) {
    return Game.creeps[name]
  }

  private CreateCreepRoleCallback(name: string, GetCreepList: (path: string[], new_vals?: any) => any[]) {
    const LIST = GetCreepList(this.file_path)
    const PENDING_INDEX = LIST.indexOf('queued')
    if (PENDING_INDEX >= 0) {
        LIST[PENDING_INDEX] = 'pending'
    }
    GetCreepList(LIST)

    return (): void => {
      const CREEP = this.FindCreepFromName(name);
      const LIST = GetCreepList(this.file_path);

      if (PENDING_INDEX >= 0) {
        LIST[PENDING_INDEX] = CREEP.id
      }
      else {
        LIST.push(CREEP.id)
      }

      GetCreepList(this.file_path, LIST);
    };
  }

  Load(file: ScreepFile, id: string) {
    this.spawn_id = id;
    this.spawn = Game.getObjectById(this.spawn_id as Id<StructureSpawn>);
    let found_spawn = this.spawn !== null;
    this.queued_roles = SafeReadFromFileWithOverwrite(file, this.queued_roles_key, this.queued_roles)
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
    else if (!this.spawn.spawning && this.queued_roles.length > 0) {
      const NEXT_ROLE_DATA = this.queued_roles.shift()!
      let Next = () => {}
      if (NEXT_ROLE_DATA.role === EntityTypes.HARVESTER_TYPE) {
        Next = this.CreateCreepRoleCallback(NEXT_ROLE_DATA.creep_name, HarvestIds)
      } else if (NEXT_ROLE_DATA.role === EntityTypes.UPGRADER_TYPE) {
        Next = this.CreateCreepRoleCallback(NEXT_ROLE_DATA.creep_name, UpgraderIds)
      } else if (NEXT_ROLE_DATA.role === EntityTypes.BUILDER_TYPE) {
        Next = this.CreateCreepRoleCallback(NEXT_ROLE_DATA.creep_name, BuilderIds)
      } else if (NEXT_ROLE_DATA.role === EntityTypes.REPAIR_TYPE) {
        Next = this.CreateCreepRoleCallback(NEXT_ROLE_DATA.creep_name, RepairIds)
      } else if (NEXT_ROLE_DATA.role === EntityTypes.ATTACK_TYPE) {
        Next = this.CreateCreepRoleCallback(NEXT_ROLE_DATA.creep_name, GaurdIds)
      } else if (NEXT_ROLE_DATA.role === EntityTypes.STRUCTURE_SUPPLIER_TYPE) {
        Next = this.CreateCreepRoleCallback(NEXT_ROLE_DATA.creep_name, TowerSuppliersIds)
      }
      Next()
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
      this.queued_roles.push({creep_name: NAME, role: behavior})
    }

    QueueData(this.file_path, QUEUE.ToArray());
  }

  Cleanup(file: ScreepFile) {
    file.WriteToFile(this.queued_roles_key, this.queued_roles)
  }

  Unload(file: ScreepFile) {}
}
