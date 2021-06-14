import { Colony } from "./Colony/Colony";
import { EventManager } from "./Events/EventManager";

class Main {
    
    constructor() {
        for(var room in Game.rooms) {
            new Colony(room)
        }

    }

    Load(): void {
        EventManager.Inst().Notify(EventManager.LOAD_EVENT)
    }

    Run(): void {
        EventManager.Inst().Notify(EventManager.RUN_EVENT)
    }

    Save(): void {
        EventManager.Inst().Notify(EventManager.SAVE_EVENT)
    }
}

var tick = new Main()

tick.Load()
tick.Run()
tick.Save()