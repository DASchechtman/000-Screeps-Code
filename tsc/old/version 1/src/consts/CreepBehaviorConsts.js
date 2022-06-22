"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionDistance = exports.Behavior = void 0;
var Behavior;
(function (Behavior) {
    Behavior[Behavior["NONE"] = -1] = "NONE";
    Behavior[Behavior["HARVEST"] = 0] = "HARVEST";
    Behavior[Behavior["UPGRADER"] = 1] = "UPGRADER";
    Behavior[Behavior["DEFENDER"] = 2] = "DEFENDER";
    Behavior[Behavior["BUILDER"] = 3] = "BUILDER";
    Behavior[Behavior["REPAIR"] = 4] = "REPAIR";
})(Behavior = exports.Behavior || (exports.Behavior = {}));
var ActionDistance;
(function (ActionDistance) {
    ActionDistance[ActionDistance["REPAIR"] = 3] = "REPAIR";
    ActionDistance[ActionDistance["BUILD"] = 3] = "BUILD";
    ActionDistance[ActionDistance["UPGRADE"] = 3] = "UPGRADE";
    ActionDistance[ActionDistance["RANGED_ATTACK"] = 3] = "RANGED_ATTACK";
    ActionDistance[ActionDistance["ATTACK"] = 1] = "ATTACK";
    ActionDistance[ActionDistance["TRANSFER"] = 1] = "TRANSFER";
    ActionDistance[ActionDistance["HARVEST"] = 1] = "HARVEST";
    ActionDistance[ActionDistance["CHANGE_SIGN"] = 1] = "CHANGE_SIGN";
})(ActionDistance = exports.ActionDistance || (exports.ActionDistance = {}));
