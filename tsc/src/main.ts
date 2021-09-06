import { Behavior } from "./consts/CreepBehaviorConsts"
import { COLONY_OWNER, DEBUG_ROOM_NAME } from "./consts/GameConstants"
import { ExtendProperties } from "./Prototypes/Prototypes"
import { Colony } from "./core/Colony"
import { HardDrive } from "./utils/harddrive/HardDrive"

ExtendProperties()

const colonies: Colony[] = []

for (let name in Game.rooms) {
    const room = Game.rooms[name]
    const controller = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_CONTROLLER}})
    const is_owned = controller[0]?.owner?.username === COLONY_OWNER

    if (controller.length > 0 && is_owned) {
        const colony = new Colony(name)
        colony.OnInit()
        colonies.push(colony)
    }
}


module.exports.loop = (): void => {
    let end = 0

    for(let colony of colonies) {
        const start = Game.cpu.getUsed()
        colony.OnTickStart()
        colony.OnTickRun()
        colony.OnTickEnd()
        colony.OnDestroy()
        
        if (colony.GetID() !== DEBUG_ROOM_NAME) {
            end += Game.cpu.getUsed() - start
        }
    }
    HardDrive.CommitChanges()

    
    if (end > 0) {
        console.log(`cpu used: ${end}`)
    }
}