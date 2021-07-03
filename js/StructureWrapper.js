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
var GameObjectConsts_1 = require("./GameObjectConsts");
var GameObject_1 = require("./GameObject");
var StructureWrapper = /** @class */ (function (_super) {
    __extends(StructureWrapper, _super);
    function StructureWrapper(struct_id, type) {
        var _this = this;
        if (typeof type === 'number') {
            _this = _super.call(this, struct_id, type) || this;
        }
        else {
            _this = _super.call(this, struct_id, GameObjectConsts_1.STRUCTURE_TYPE) || this;
        }
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
    };
    StructureWrapper.prototype.OnRun = function () {
    };
    StructureWrapper.prototype.OnSave = function () {
    };
    StructureWrapper.prototype.GetCurHealth = function () {
        return this.m_Cur_health;
    };
    StructureWrapper.prototype.GetMaxHealth = function () {
        return this.m_Max_health;
    };
    return StructureWrapper;
}(GameObject_1.GameObject));
exports.StructureWrapper = StructureWrapper;
