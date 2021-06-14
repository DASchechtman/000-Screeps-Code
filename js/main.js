"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Colony_1 = require("./Colony");
var EventManager_1 = require("./EventManager");
var Main = /** @class */ (function () {
    function Main() {
        for (var room in Game.rooms) {
            new Colony_1.Colony(room);
        }
    }
    Main.prototype.Load = function () {
        EventManager_1.EventManager.Inst().Notify(EventManager_1.EventManager.LOAD_EVENT);
    };
    Main.prototype.Run = function () {
        EventManager_1.EventManager.Inst().Notify(EventManager_1.EventManager.RUN_EVENT);
    };
    Main.prototype.Save = function () {
        EventManager_1.EventManager.Inst().Notify(EventManager_1.EventManager.SAVE_EVENT);
    };
    return Main;
}());
var tick = new Main();
tick.Load();
tick.Run();
tick.Save();
