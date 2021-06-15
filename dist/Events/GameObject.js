"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObject = void 0;
var EventManager_1 = require("./EventManager");
var GameObject = /** @class */ (function () {
    function GameObject() {
        EventManager_1.EventManager.Inst().Add(this);
    }
    GameObject.prototype.OnLoad = function () { };
    GameObject.prototype.OnRun = function () { };
    GameObject.prototype.OnSave = function () { };
    GameObject.prototype.OnInvasion = function () { };
    return GameObject;
}());
exports.GameObject = GameObject;
