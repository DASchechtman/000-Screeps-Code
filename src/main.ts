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
    at(index: number): T
    clear(): void
    resize(size: number): void
    toString(): string
    everyInstance(callback: (element: T, index: number, array: T[]) => boolean): number
  }

  interface String {
    replaceAll(searchValue: string | RegExp, replaceValue: string): string
  }

  interface RoomPosition {
    Equals(pos: RoomPosition): boolean
  }

}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: any;
}

Array.prototype.at = function(index: number) {
  index = Math.trunc(index)

  if (index < 0) {
    let i = this.length + index
    if (i < 0) {
      let x = -Math.trunc(index / this.length) * this.length
      i = this.length + x + index
      if (i === this.length) { i = 0 }
    }

    return this[i]
  }
  else {
    return this[index % this.length]
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

Array.prototype.everyInstance = function<T>(callback: (element: T, index: number, array: T[]) => boolean): number {
  let inst_count = 0
  for (let i = 0; i < this.length; i++) {
    inst_count += Number(callback(this[i], i, this))
  }
  return inst_count
}

String.prototype.replaceAll = function(searchValue: string | RegExp, replaceValue: string): string {
  if (typeof searchValue === 'string') {
    return this.split(searchValue).join(replaceValue)
  }
  else {
    return this.replace(searchValue, replaceValue)
  }
}

RoomPosition.prototype.Equals = function(pos: RoomPosition): boolean {
  return this.x === pos.x && this.y === pos.y && this.roomName === pos.roomName
}



export function KillAllCreeps() {
  for (let name in Game.creeps) {
    const CREEP = Game.creeps[name];
    CREEP?.suicide();
  }
}
let kill = Array.from(Object.values(Game.rooms)).some(r => {
  const CONTROLLER = r.controller
  return CONTROLLER?.owner?.username === 'test'
})

let x = [1,2,3,4,5].at(-7)

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
    CREEP_MANAGER.QueueNextSpawnBody()
    const STRUCTS = ROOM_DATA.GetOwnedStructureIds()

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
