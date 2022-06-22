"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendProperties = void 0;
const ExtendedRoomPosition_1 = require("./Extended/ExtendedRoomPosition");
const ExtendedStructure_1 = require("./Extended/ExtendedStructure");
function AddProperty(base_obj, prop_name, prop) {
    var _a;
    const is_constructor = prop_name === "constructor";
    const override = ((_a = base_obj.prototype[prop_name]) === null || _a === void 0 ? void 0 : _a.toString()) !== (prop === null || prop === void 0 ? void 0 : prop.toString());
    if (override) {
        base_obj.prototype[prop_name] = prop;
    }
    else {
        console.log("property already exists");
    }
}
function AddAllProperties(base_obj, extended_obj) {
    const extended_proto = extended_obj.prototype;
    const p = Object.getOwnPropertyNames(extended_proto);
    for (let p_name of p) {
        const func = extended_proto[p_name];
        AddProperty(base_obj, p_name, func);
    }
}
function ExtendProperties() {
    AddAllProperties(RoomPosition, ExtendedRoomPosition_1.ExtendedRoomPosition);
    AddAllProperties(Structure, ExtendedStructure_1.ExtendedStructure);
}
exports.ExtendProperties = ExtendProperties;
