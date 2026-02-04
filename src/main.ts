import { Json } from "Consts";
import { CreepObjectManager } from "Creeps/CreepObjManager";
import { FileSystem } from "FileSystem/FileSystem";
import { RoomData } from "Rooms/RoomData";
import { DebugLogger } from "utils/DebugLogger";
import { ErrorMapper } from "utils/ErrorMapper";
import { Timer } from "utils/Timer";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
          You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    [key: string]: Json | undefined;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  interface Array<T> {
    at(index: number): T | undefined
    clear(): void
    resize(size: number): void
    toString(): string
  }

}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: any;
}

Array.prototype.at = function(index: number) {
  if (index >= this.length) {
    return undefined
  }
  else if (index < 0 && this.length + index < 0) {
    return undefined
  }

  if (index < 0) {
    return this[this.length + index]
  }
  else {
    return this[index]
  }
}

Array.prototype.clear = function() {
  this.splice(0)
}

Array.prototype.toString = function() {
  return `[${this.join(', ')}]`
}

Array.prototype.resize = function(size: number) {
  if (size < 0 || size >= this.length || this.length - size < 0) { return }
  this.splice(size, this.length - size)
}

export function KillAllCreeps() {
  const MY_CREEPS = RoomData.GetRoomData().GetMyCreepIds()
  for (let id of MY_CREEPS) {
    let creep = Game.getObjectById(id)
    console.log(creep?.suicide())
  }
}
let kill = Array.from(Object.values(Game.rooms)).some(r => {
  const CONTROLLER = r.controller
  return CONTROLLER?.owner?.username === 'test'
})

let reset = false
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  DebugLogger.InitLogger()
  const FILE_SYSTEM = FileSystem.GetFileSystem()
  const CREEP_MANAGER = CreepObjectManager.GetCreepManager()
  const ROOM_DATA = RoomData.GetRoomData()

  for (let room_name in Game.rooms) {
    ROOM_DATA.SetRoomName(room_name)
    CREEP_MANAGER.LoadEntityData(room_name)

    const MY_CREEPS = ROOM_DATA.GetMyCreepIds()
    const SPAWN = ROOM_DATA.GetOwnedStructureIds([STRUCTURE_SPAWN])
    const STRUCTS = ROOM_DATA.GetOwnedStructureIds([STRUCTURE_TOWER])
    CREEP_MANAGER.QueueNextSpawnBody()
    const [BODY, NAME] = CREEP_MANAGER.GetSpawnBody()

    if (BODY.length > 0) {
      Game.getObjectById(SPAWN[0] as Id<StructureSpawn>)?.spawnCreep(BODY, NAME)
    }

    for (let creep_id of MY_CREEPS) {
      CREEP_MANAGER.AddCreepId(creep_id)
    }

    for (let struct_id of STRUCTS) {
      CREEP_MANAGER.AddStructureId(struct_id)
    }

    CREEP_MANAGER.RunAllActiveEntities()
    CREEP_MANAGER.SaveCreepData()
  }

   if (kill && reset) {
    console.log('killing all creeps')
    KillAllCreeps()
    kill = false
  }


  Timer.AdvanceAllTimers()
  //FILE_SYSTEM.ClearFileSystem()
  FILE_SYSTEM.Cleanup()
});
