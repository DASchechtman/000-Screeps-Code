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
import { SafeReadFromFileWithOverwrite, SafeWriteToFile } from "utils/UtilFuncs";
import { create } from "lodash";
import { JsonObj } from "Consts";
import { Timer } from "utils/Timer";

export class SpawnBehavior implements EntityBehavior {
  private spawn: StructureSpawn | null = null;
  private spawn_id: string = "";
  private room_name = "<INSERT ROOM NAME>";
  private queued_roles = new Array<{ creep_name: string; role: EntityTypes; }>();
  private file = new Array<string>();
  private queued_roles_key = "roles";
  private spawn_response_code: ScreepsReturnCode = OK;
  private next_creep_name = ""
  private next_creep_role: EntityTypes | null = null;

  constructor() {

  }

  private GetFilePath() {
    return ["entities", this.room_name, "info"];
  }

  private GetCreepName(behavior: EntityTypes) {
    let x = true;
    const STR_BUILDER = new StringBuilder(EntityTypes[behavior]);

    STR_BUILDER.MapFrom(0, str => {
      if (str === "_") {
        x = true;
        return " ";
      }
      let ret = x ? str : str.toLocaleLowerCase();
      x = false;
      return ret;
    });

    STR_BUILDER.AppendChars(` - ${Game.time}`);
    return STR_BUILDER.toString();
  }

  private AddCreepToRoleList(creep: Creep, list: string[]) {
    const INDEX = list.findIndex(id => id.length <= 10);
    if (INDEX >= 0) {
      list[INDEX] = creep.id;
    }
    else {
      list.push(creep.id);
    }
    return list
  }

  private SpawnNextCreep(next_role: EntityTypes, creep: Creep | undefined) {
    if (creep == null) { return false }

    switch (next_role) {
        case EntityTypes.HARVESTER_TYPE: {
          const LIST = this.AddCreepToRoleList(creep, HarvestIds(this.GetFilePath()))
          HarvestIds(this.GetFilePath(), LIST);
          this.queued_roles.shift();
          break
        }
        case EntityTypes.UPGRADER_TYPE: {
          const LIST = this.AddCreepToRoleList(creep, UpgraderIds(this.GetFilePath()))
          UpgraderIds(this.GetFilePath(), LIST);
          this.queued_roles.shift();
          break
        }
        case EntityTypes.BUILDER_TYPE: {
          const LIST = this.AddCreepToRoleList(creep, BuilderIds(this.GetFilePath()))
          BuilderIds(this.GetFilePath(), LIST);
          this.queued_roles.shift();
          break
        }
        case EntityTypes.REPAIR_TYPE: {
          const LIST = this.AddCreepToRoleList(creep, RepairIds(this.GetFilePath()))
          RepairIds(this.GetFilePath(), LIST);
          this.queued_roles.shift();
          break
        }
        case EntityTypes.ATTACK_TYPE: {
          const LIST = this.AddCreepToRoleList(creep, GaurdIds(this.GetFilePath()))
          GaurdIds(this.GetFilePath(), LIST);
          this.queued_roles.shift();
          break
        }
        case EntityTypes.STRUCTURE_SUPPLIER_TYPE: {
          const LIST = this.AddCreepToRoleList(creep, TowerSuppliersIds(this.GetFilePath()))
          TowerSuppliersIds(this.GetFilePath(), LIST);
          this.queued_roles.shift();
          break
        }
      }

      return true
  }

  Load(file: ScreepFile, id: string) {
    this.spawn_id = id;
    this.spawn = Game.getObjectById(this.spawn_id as Id<StructureSpawn>);
    let found_spawn = this.spawn !== null;
    this.file = file.GetFilePath();
    this.queued_roles = SafeReadFromFileWithOverwrite(this.file, this.queued_roles_key, [
      { creep_name: "placeholder", role: EntityTypes.HARVESTER_TYPE }
    ]);

    if (found_spawn) {
      this.room_name = `_${this.spawn!.room.name}`;
    }
    return found_spawn;
  }

  Run() {
    if (this.spawn === null) {
      return;
    }

    if (!this.spawn.spawning && this.queued_roles.length > 0) {
      const NEXT_CREEP = this.queued_roles[0];
      const NEXT_NAME = NEXT_CREEP.creep_name;
      const NEXT_ROLE = NEXT_CREEP.role;

      if (this.next_creep_role == null) {
        this.next_creep_role = NEXT_ROLE;
        this.next_creep_name = NEXT_NAME;
      }

      if (this.SpawnNextCreep(this.next_creep_role, Game.creeps[this.next_creep_name])) {
        this.next_creep_name = "";
        this.next_creep_role = null;
      }
    }

    const QUEUE = QueueData(this.GetFilePath())
    const NEXT = QUEUE.length > 0 ? QUEUE[0] : null;

    if (!NEXT) { return }

    const RES = this.spawn.spawnCreep(NEXT.body, this.GetCreepName(NEXT.creep_type))

    if (RES === OK) {
      this.next_creep_name = this.GetCreepName(NEXT.creep_type);
      this.next_creep_role = NEXT.creep_type;
      this.queued_roles.push({ creep_name: this.next_creep_name, role: this.next_creep_role });
    }

  }

  Cleanup(file: ScreepFile) {
    file.WriteToFile(this.queued_roles_key, this.queued_roles);
  }

  Unload(file: ScreepFile) {}

  RecieveOrder(order_data: JsonObj) {
    return () => { return {} }
  }
}
