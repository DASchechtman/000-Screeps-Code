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
exports.TimedStructureWrapper = void 0;
var GameObjectConsts_1 = require("./GameObjectConsts");
var StructureWrapper_1 = require("./StructureWrapper");
var TimedStructureWrapper = /** @class */ (function (_super) {
    __extends(TimedStructureWrapper, _super);
    function TimedStructureWrapper(struct_id) {
        var _this = _super.call(this, struct_id, GameObjectConsts_1.TIMED_STRUCTURE_TYPE) || this;
        var x = _this.m_Cur_health;
        return _this;
    }
    TimedStructureWrapper.prototype.OnLoad = function () {
    };
    TimedStructureWrapper.prototype.OnRun = function () {
    };
    TimedStructureWrapper.prototype.OnSave = function () {
    };
    return TimedStructureWrapper;
}(StructureWrapper_1.StructureWrapper));
exports.TimedStructureWrapper = TimedStructureWrapper;
