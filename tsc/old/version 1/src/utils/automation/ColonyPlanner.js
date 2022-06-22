"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColonyPlanner = void 0;
const GameConstants_1 = require("../../consts/GameConstants");
const PlanLayer_1 = require("./PlanLayer");
class ColonyPlanner {
    constructor(room_name) {
        this.m_Layers = [];
        this.m_Room_name = room_name;
        this.m_Struct_list = new Array();
        this.m_Struct_list.push({
            type: STRUCTURE_EXTENSION,
            amount: 5
        });
    }
    static GetInst(room_name) {
        if (!this.m_Inst.has(room_name)) {
            this.m_Inst.set(room_name, new ColonyPlanner(room_name));
        }
        return this.m_Inst.get(room_name);
    }
    GetCornersOfSquare(offset, spawn_point) {
        const corners = [
            {
                x: spawn_point.x - offset,
                y: spawn_point.y - offset
            },
            {
                x: spawn_point.x + offset,
                y: spawn_point.y - offset
            },
            {
                x: spawn_point.x - offset,
                y: spawn_point.y + offset
            },
            {
                x: spawn_point.x + offset,
                y: spawn_point.y + offset
            }
        ];
        return corners;
    }
    Build(level, spawn_point, room) {
        const corners = this.GetCornersOfSquare(level * GameConstants_1.DEFENSE_DEV_LEVELS, spawn_point);
        if (this.m_Layers.length === 0) {
            const layer = new PlanLayer_1.PlanLayer(corners, this.m_Room_name);
            layer.MakePerimeter(room);
            this.m_Layers.push(layer);
            for (let i = 0; i < this.m_Struct_list[level - 2].amount; i++) {
                layer.SetStructure(room, this.m_Struct_list[level - 2].type);
            }
        }
    }
}
exports.ColonyPlanner = ColonyPlanner;
ColonyPlanner.m_Inst = new Map();
