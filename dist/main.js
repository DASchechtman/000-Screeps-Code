"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Colony_1 = require("./Colony/Colony");
var EventConsts_1 = require("./Constants/EventConsts");
var EventManager_1 = require("./Events/EventManager");
var Main = /** @class */ (function () {
    function Main() {
        for (var room in Game.rooms) {
            new Colony_1.Colony(room);
        }
    }
    Main.prototype.GetEventName = function (event) {
        var name = "";
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
    };
    Main.prototype.Execute = function (event, show_stats) {
        if (show_stats === void 0) { show_stats = false; }
        var event_name = this.GetEventName(event);
        if (show_stats) {
            console.log("cpu used before " + event_name + ": " + Game.cpu.getUsed());
        }
        EventManager_1.EventManager.Inst().Notify(event);
        if (show_stats) {
            console.log("cpu used after " + event_name + ": " + Game.cpu.getUsed());
        }
    };
    Main.prototype.Load = function () {
        this.Execute(EventConsts_1.LOAD_EVENT, true);
    };
    Main.prototype.Run = function () {
        this.Execute(EventConsts_1.RUN_EVENT, true);
    };
    Main.prototype.Save = function () {
        this.Execute(EventConsts_1.SAVE_EVENT, true);
    };
    return Main;
}());
var tick = new Main();
tick.Load();
tick.Run();
tick.Save();
