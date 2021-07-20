"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Colony_1 = require("./Colony");
const EventConsts_1 = require("./EventConsts");
const HardDrive_1 = require("./HardDrive");
const EventManager_1 = require("./EventManager");
class Main {
    constructor() {
        Game.cpu.shardLimits;
        for (var room in Game.rooms) {
            new Colony_1.Colony(room);
        }
    }
    GetEventName(event) {
        let name = "";
        switch (event) {
            case EventConsts_1.LOAD_EVENT: {
                name = "LOAD";
                break;
            }
            case EventConsts_1.RUN_EVENT: {
                name = "RUN";
                break;
            }
            case EventConsts_1.SAVE_EVENT: {
                name = "SAVE";
                break;
            }
        }
        return name;
    }
    Execute(event, show_stats = false) {
        const event_name = this.GetEventName(event);
        if (show_stats) {
            console.log(`cpu used before ${event_name}: ${Game.cpu.getUsed()}`);
        }
        EventManager_1.EventManager.Inst().Notify(event);
        if (show_stats) {
            console.log(`cpu used after ${event_name}: ${Game.cpu.getUsed()}`);
        }
    }
    Load() {
        this.Execute(EventConsts_1.LOAD_EVENT);
    }
    Run() {
        this.Execute(EventConsts_1.RUN_EVENT);
    }
    Save() {
        this.Execute(EventConsts_1.SAVE_EVENT);
        HardDrive_1.HardDrive.CommitChanges();
    }
}
if (Game.cpu.limit === 0) {
    const shard_name_len = Game.shard.name.length - 1;
    const shard_num = Number.parseInt(Game.shard.name[shard_name_len]);
    Game.cpu.setShardLimits({ shard: shard_num, cpu: 20 });
}
else {
    var tick = new Main();
    let start = Game.cpu.getUsed();
    tick.Load();
    tick.Run();
    tick.Save();
    let end = Game.cpu.getUsed() - start;
    console.log(end, Game.cpu.bucket);
}
