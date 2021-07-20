import { cpuUsage } from "process";
import { Colony } from "./Colony/Colony";
import { LOAD_EVENT, RUN_EVENT, SAVE_EVENT } from "./Constants/EventConsts";
import { CpuTimer } from "./CpuTimer";
import { HardDrive } from "./Disk/HardDrive";
import { EventManager } from "./Events/EventManager";
import { Output } from "./Output/Output";

class Main {

    constructor() {
        Game.cpu.shardLimits
        for (var room in Game.rooms) {
            new Colony(room)
        }

    }

    private GetEventName(event: number): string {
        let name: string = ""

        switch (event) {
            case LOAD_EVENT: {
                name = "LOAD"
                break
            }
            case RUN_EVENT: {
                name = "RUN"
                break
            }
            case SAVE_EVENT: {
                name = "SAVE"
                break
            }
        }

        return name
    }

    private Execute(event: number, show_stats: boolean = false) {
        const event_name = this.GetEventName(event)
        if (show_stats) {
            console.log(`cpu used before ${event_name}: ${Game.cpu.getUsed()}`)
        }
        EventManager.Inst().Notify(event)
        if (show_stats) {
            console.log(`cpu used after ${event_name}: ${Game.cpu.getUsed()}`)
        }
    }

    Load(): void {
        this.Execute(LOAD_EVENT)
    }

    Run(): void {
        this.Execute(RUN_EVENT)
    }

    Save(): void {
        this.Execute(SAVE_EVENT)
        HardDrive.CommitChanges()
    }
}

if (Game.cpu.limit === 0) {
    const shard_name_len = Game.shard.name.length - 1
    const shard_num = Number.parseInt(Game.shard.name[shard_name_len])
    Game.cpu.setShardLimits({ shard: shard_num, cpu: 20 })
}
else {
    var tick = new Main()
    let start = Game.cpu.getUsed()
    tick.Load()
    tick.Run()
    tick.Save()
    let end = Game.cpu.getUsed() - start
    console.log(end, Game.cpu.bucket)
}
