import { JsonObj } from "Consts";
import { ScreepFile, ScreepMetaFile } from "FileSystem/File";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { EntityBehavior, EntityState, EntityStateManager } from "./BehaviorTypes";
const ENEMIES_FILE = ["enemies", "blacklist"];
const ENEMIES_KEY = "enemies";

class GaurdState implements EntityState {
  private creep_id: Id<Creep>;
  constructor(id: Id<Creep>) {
    this.creep_id = id;
  }

  private BlacklistedCreepsInRoom() {
    const FILE = FileSystem.GetFileSystem().GetFile(ENEMIES_FILE);
    const BLACK_LIST = SafeReadFromFileWithOverwrite(FILE, ENEMIES_KEY, new Array<string>());
    const ENEMIES_IN_ROOM = RoomData.GetRoomData()
      .GetAllEnemyCreepIds()
      .some(id => {
        const ENEMY = Game.getObjectById(id);
        if (ENEMY === null) {
          return false;
        }

        return BLACK_LIST.includes(ENEMY.owner.username);
      });

    return ENEMIES_IN_ROOM;
  }

  private AnyCreepsDamaged() {
    const DAMAGED_CREEPS = RoomData.GetRoomData()
      .GetMyCreepIds()
      .some(id => {
        const CREEP = Game.getObjectById(id);
        if (CREEP === null) {
          return false;
        }
        return CREEP.hits < CREEP.hitsMax;
      });
    return DAMAGED_CREEPS;
  }

  RunState() {
    const CREEP = Game.getObjectById(this.creep_id);
    if (CREEP === null) {
      return false;
    }
    CREEP.moveTo(12, 14);
    return true;
  }

  GetNextState(): EntityState {
    const FILE = FileSystem.GetFileSystem().GetFile(ENEMIES_FILE);
    if (this.BlacklistedCreepsInRoom()) {
      return new AttackState(this.creep_id);
    } else if (this.AnyCreepsDamaged()) {
      const CREEPS = RoomData.GetRoomData().GetAllEnemyCreepIds();
      const BLACK_LIST = SafeReadFromFileWithOverwrite(FILE, ENEMIES_KEY, new Array<string>());

      for (let id of CREEPS) {
        const CREEP = Game.getObjectById(id);
        if (CREEP === null) {
          continue;
        }
        if (!BLACK_LIST.includes(CREEP.owner.username)) {
          BLACK_LIST.push(CREEP.owner.username);
        }
      }

      FILE.WriteToFile(ENEMIES_KEY, BLACK_LIST);

      return new AttackState(this.creep_id);
    }
    return this;
  }
}

class AttackState implements EntityState {
  private enemy_creep_ids: Id<Creep>[];
  private index: number;
  private creep_id: Id<Creep>;
  constructor(id: Id<Creep>) {
    this.creep_id = id;
    this.enemy_creep_ids = [];
    this.index = 0;
  }

  private GetBlackList() {
    const FILE = FileSystem.GetFileSystem().GetFile(ENEMIES_FILE);
    const BLACK_LIST = SafeReadFromFileWithOverwrite(FILE, ENEMIES_KEY, new Array<string>());
    return BLACK_LIST;
  }

  RunState() {
    const CREEP = Game.getObjectById(this.creep_id);
    if (CREEP === null) {
      return false;
    }
    const BLACK_LIST = this.GetBlackList();
    this.enemy_creep_ids = RoomData.GetRoomData().GetAllEnemyCreepIds();

    const INDEX = this.enemy_creep_ids.findIndex(id => {
      const ENEMY_CREEP = Game.getObjectById(id);
      if (ENEMY_CREEP === null) {
        return false;
      }
      return BLACK_LIST.includes(ENEMY_CREEP.owner.username);
    });

    if (INDEX < 0) {
      return true;
    }

    const ENEMY = Game.getObjectById(this.enemy_creep_ids[INDEX]);
    if (ENEMY === null) {
      return true;
    }

    let ret = CREEP.attack(ENEMY);
    if (ret === ERR_NOT_IN_RANGE) {
      CREEP.moveTo(ENEMY);
    }

    return true;
  }

  GetNextState() {
    if (this.enemy_creep_ids.length === 0) {
      return new GaurdState(this.creep_id);
    }
    return this;
  }
}

export class AttackBehavior implements EntityBehavior {
  private static state_manager_map = new Map<Id<Creep>, EntityStateManager>();
  private static GetStateManager(id: Id<Creep>) {
    if (!this.state_manager_map.has(id)) {
      this.state_manager_map.set(id, new EntityStateManager(new GaurdState(id)));
    }
    return this.state_manager_map.get(id)!;
  }

  private static RemoveStateManager(id: Id<Creep>) {
    this.state_manager_map.delete(id);
  }

  private creep: Creep | null;
  private enemy_creep_ids: string[];
  private ally_creeps: string[];
  private data: JsonObj;
  private state_key: string;
  private enemy_key: string;
  private enemy_file: ScreepFile;
  private file: ScreepFile | null;
  private creep_id: string;

  constructor() {
    this.enemy_creep_ids = [];
    this.ally_creeps = [];
    this.data = {};
    this.state_key = "state";
    this.enemy_key = "enemies";
    this.creep = null;
    this.enemy_file = FileSystem.GetFileSystem().GetFile(ENEMIES_FILE);
    this.file = null;
    this.creep_id = "";
  }

  public Load(file: ScreepFile, id: string) {
    this.enemy_file = FileSystem.GetFileSystem().GetFile(ENEMIES_FILE);
    this.creep = Game.getObjectById(id as Id<Creep>);
    this.enemy_creep_ids = RoomData.GetRoomData().GetAllEnemyCreepIds();
    this.ally_creeps = RoomData.GetRoomData().GetMyCreepIds();
    this.file = file;
    this.creep_id = id;

    let state = SafeReadFromFileWithOverwrite(file, this.state_key, false);
    let enemies = SafeReadFromFileWithOverwrite(this.enemy_file, this.enemy_key, new Array<string>());

    const INJURED_CREEP_COUNT = this.ally_creeps
      .map(c => Game.getObjectById(c as Id<Creep>))
      .filter(c => c != null && c.hits < c.hitsMax).length;

    if (INJURED_CREEP_COUNT > 0) {
      this.data[this.state_key] = true;
    } else {
      this.data[this.state_key] = false;
    }

    this.data[this.state_key] = state;
    this.data[this.enemy_key] = enemies;

    return this.creep != null;
  }

  public Run() {
    const MANAGER = AttackBehavior.GetStateManager(this.creep_id as Id<Creep>);
    if (MANAGER.RunState(this.file!)) {
      MANAGER.GetNextState();
    }
  }

  public Cleanup(file: ScreepFile) {
    file.WriteToFile(this.state_key, this.data[this.state_key]);
    this.enemy_file.WriteToFile(this.enemy_key, this.data[this.enemy_key]);
  }

  public Unload(file: ScreepFile) {
    AttackBehavior.RemoveStateManager(this.creep_id as Id<Creep>);
  }
}
