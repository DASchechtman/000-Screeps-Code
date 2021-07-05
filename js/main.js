"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Colony_1 = require("./Colony");
var EventConsts_1 = require("./EventConsts");
var EventManager_1 = require("./EventManager");
var Main = /** @class */ (function () {
    function Main() {
        for (var room in Game.rooms) {
            new Colony_1.Colony(room);
        }
    }
    Main.prototype.Load = function () {
        EventManager_1.EventManager.Inst().Notify(EventConsts_1.LOAD_EVENT);
    };
    Main.prototype.Run = function () {
        EventManager_1.EventManager.Inst().Notify(EventConsts_1.RUN_EVENT);
    };
    Main.prototype.Save = function () {
        EventManager_1.EventManager.Inst().Notify(EventConsts_1.SAVE_EVENT);
    };
    return Main;
}());
var tick = new Main();
tick.Load();
tick.Run();
tick.Save();
