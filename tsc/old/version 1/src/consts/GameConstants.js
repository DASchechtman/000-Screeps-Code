"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLONY_ALLIES = exports.EventTypes = exports.GameEntityTypes = exports.DEFENSE_DEV_LEVELS = exports.DEBUG_ROOM_NAME = exports.COLONY_OWNER = void 0;
exports.COLONY_OWNER = "DasBootLoader2";
exports.DEBUG_ROOM_NAME = "sim";
exports.DEFENSE_DEV_LEVELS = 3;
var GameEntityTypes;
(function (GameEntityTypes) {
    GameEntityTypes[GameEntityTypes["COLONY"] = 0] = "COLONY";
    GameEntityTypes[GameEntityTypes["CREEP"] = 1] = "CREEP";
    GameEntityTypes[GameEntityTypes["STRUCT"] = 2] = "STRUCT";
    GameEntityTypes[GameEntityTypes["DEGRADABLE_STRUCT"] = 3] = "DEGRADABLE_STRUCT";
    GameEntityTypes[GameEntityTypes["BEHAVIOR_STRUCT"] = 4] = "BEHAVIOR_STRUCT";
    GameEntityTypes[GameEntityTypes["ERROR"] = 5] = "ERROR";
})(GameEntityTypes = exports.GameEntityTypes || (exports.GameEntityTypes = {}));
var EventTypes;
(function (EventTypes) {
    EventTypes[EventTypes["INVASION"] = 0] = "INVASION";
})(EventTypes = exports.EventTypes || (exports.EventTypes = {}));
exports.COLONY_ALLIES = [
    "Zpike"
];
