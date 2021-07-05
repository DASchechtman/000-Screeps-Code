import { Colony } from "./Colony/Colony";
import { LOAD_EVENT, RUN_EVENT, SAVE_EVENT } from "./Constants/EventConsts";
import { EventManager } from "./Events/EventManager";

class Main {
    
    constructor() {
        for(var room in Game.rooms) {
            new Colony(room)
        }

    }

    Load(): void {
        EventManager.Inst().Notify(LOAD_EVENT)
    }

    Run(): void {
        EventManager.Inst().Notify(RUN_EVENT)
    }

    Save(): void {
        EventManager.Inst().Notify(SAVE_EVENT)
    }
}

var tick = new Main()

tick.Load()
tick.Run()
tick.Save()