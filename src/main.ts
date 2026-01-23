import { HARVESTER_TYPE, UPGRADER_TYPE } from "Creeps/CreepBehaviors.ts/BehaviorTypes";
import { CreepObjectManager } from "Creeps/CreepObjManager";
import { FileSystem } from "FileSystem/FileSystem";
import { ErrorMapper } from "utils/ErrorMapper";

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
    [key: string]: any
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: any;
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  const FILE_SYSTEM = FileSystem.GetFileSystem()
  const CREEP_MANAGER = CreepObjectManager.GetCreepManager()

  for (let room_name in Game.rooms) {
    const ROOM = Game.rooms[room_name]
    const MY_CREEPS = ROOM.find(FIND_MY_CREEPS, {
      filter: (c) => { return !c.spawning }
    })

    const SPAWN = ROOM.find(FIND_MY_SPAWNS)
    const CREEP_NAME = `Creep - ${new Date().toUTCString()}`

    let behavior_type = -1

    if (MY_CREEPS.length < 2) {

      SPAWN[0].spawnCreep([MOVE, CARRY, WORK, WORK], CREEP_NAME)
      behavior_type = HARVESTER_TYPE
    }
    else if (MY_CREEPS.length < 3) {
      SPAWN[0].spawnCreep([MOVE, CARRY, WORK, WORK], CREEP_NAME)
      behavior_type = UPGRADER_TYPE
    }

    for (let creep of MY_CREEPS) { CREEP_MANAGER.AddCreepId(creep.id) }

    CREEP_MANAGER.RunAllActiveCreeps()
  }

  FILE_SYSTEM.Cleanup()
});
