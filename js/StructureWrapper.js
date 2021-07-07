"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureWrapper = void 0;
var CreepBehaviorConsts_1 = require("./CreepBehaviorConsts");
var GameObjectConsts_1 = require("./GameObjectConsts");
var GameObject_1 = require("./GameObject");
var SignalManager_1 = require("./SignalManager");
var StructureWrapper = /** @class */ (function (_super) {
    __extends(StructureWrapper, _super);
    function StructureWrapper(struct_id, type) {
        if (type === void 0) { type = GameObjectConsts_1.STRUCTURE_TYPE; }
        var _this = _super.call(this, struct_id, type) || this;
        _this.m_Struct_id = struct_id;
        _this.m_Struct = Game.getObjectById(_this.m_Struct_id);
        _this.m_Cur_health = 0;
        _this.m_Max_health = 0;
        if (_this.m_Struct) {
            _this.m_Cur_health = _this.m_Struct.hits;
            _this.m_Max_health = _this.m_Struct.hitsMax;
        }
        return _this;
    }
    StructureWrapper.prototype.OnLoad = function () {
        if (this.m_Cur_health < this.m_Max_health) {
            var signal = {
                from: this,
                data: {},
                filter: function (sender, reciever) {
                    var type = reciever.SignalRecieverType();
                    var ret = false;
                    if (type === GameObjectConsts_1.CREEP_TYPE) {
                        var creep = reciever;
                        ret = (creep.GetBehavior() === CreepBehaviorConsts_1.REPAIR_BEHAVIOR);
                    }
                    return ret;
                }
            };
            SignalManager_1.SignalManager.Inst().SendSignal(signal);
        }
    };
    StructureWrapper.prototype.GetCurHealth = function () {
        return this.m_Cur_health;
    };
    StructureWrapper.prototype.GetMaxHealth = function () {
        return this.m_Max_health;
    };
    StructureWrapper.prototype.GetStructure = function () {
        return this.m_Struct;
    };
    return StructureWrapper;
}(GameObject_1.GameObject));
exports.StructureWrapper = StructureWrapper;
