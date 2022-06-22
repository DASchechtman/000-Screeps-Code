"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InRoomPathFinder = void 0;
const Enums_1 = require("../../types/Enums");
const PriorityQueue_1 = require("../datastructures/PriorityQueue");
const HardDrive_1 = require("../harddrive/HardDrive");
const JsonTreeNode_1 = require("../harddrive/JsonTreeNode");
const RoomGrid_1 = require("./RoomGrid");
class InRoomPathFinder {
    constructor() {
        this.m_Grid = null;
        this.m_Generator = null;
        InRoomPathFinder.m_Room_grids = new Map();
    }
    GetPoint(obj) {
        let point;
        try {
            point = obj.pos.ToPoint();
        }
        catch (_a) {
            point = obj.ToPoint();
        }
        return point;
    }
    GetNodesList() {
        return [
            {
                point: this.m_Grid.GetPositionTop(),
                dir: TOP
            },
            {
                point: this.m_Grid.GetPositionTopRight(),
                dir: TOP_RIGHT
            },
            {
                point: this.m_Grid.GetPostionRight(),
                dir: RIGHT
            },
            {
                point: this.m_Grid.GetPositionBottomRight(),
                dir: BOTTOM_RIGHT
            },
            {
                point: this.m_Grid.GetPositionBottom(),
                dir: BOTTOM
            },
            {
                point: this.m_Grid.GetPositionBottomLeft(),
                dir: BOTTOM_LEFT
            },
            {
                point: this.m_Grid.GetPositionLeft(),
                dir: LEFT
            },
            {
                point: this.m_Grid.GetPositionTopLeft(),
                dir: TOP_LEFT
            }
        ];
    }
    H(p1, p2) {
        const x = Math.pow(p2.x - p1.x, 2);
        const y = Math.pow(p2.y - p1.y, 2);
        return Math.sqrt(x + y);
    }
    G(p) {
        var _a, _b;
        let terrain_type = this.m_Grid.GetTerrainAt(p.x, p.y);
        if ((_a = this.m_Grid) === null || _a === void 0 ? void 0 : _a.SpotIsUsed(p.x, p.y)) {
            terrain_type = Enums_1.TerrainTypes.OCCUPIED_TERRAIN;
        }
        else if ((_b = this.m_Grid) === null || _b === void 0 ? void 0 : _b.HasRoad(p.x, p.y)) {
            terrain_type = Enums_1.TerrainTypes.ROAD_TERRAIN;
        }
        return terrain_type;
    }
    GetQueue() {
        const sort_algo = (el) => {
            return el.F;
        };
        const queue = new PriorityQueue_1.PriorityQueue(sort_algo);
        return queue;
    }
    InRange(p1, p2, range) {
        const r_x = Math.abs(p1.x - p2.x);
        const r_y = Math.abs(p1.y - p2.y);
        return r_x <= range && r_y <= range;
    }
    CreatePath(current) {
        const path = [];
        const color_blue = "#ADD8E6";
        while (current) {
            if (current.dir) {
                path.unshift({ dir: current.dir, p: current.pos });
            }
            this.ShowSearch(current.pos, color_blue);
            current = current.parent;
        }
        return path;
    }
    ShowSearch(pos, color = "#00FF00") {
        const vis = new RoomVisual(this.m_Grid.GetRoomName());
        const style = {
            fill: color
        };
        vis.circle(pos.x, pos.y, style);
    }
    AddToOpen(queue, map, val) {
        queue.Push(val);
        map.set(val, undefined);
    }
    Clear(queue, open, close) {
        queue.Clear();
        open.clear();
        close.clear();
    }
    RemoveFromOpen(queue, map) {
        const current = queue.Pop();
        if (current) {
            map.delete(current);
        }
        return current;
    }
    CalculatePath(cur_node, dest, range, creep, steps) {
        var _a, _b;
        const open = new Map();
        const close = new Map();
        const queue = this.GetQueue();
        const color_red = "#FF0000";
        let found = false;
        this.AddToOpen(queue, open, cur_node);
        let i = 0;
        let current = null;
        while (queue.Size() > 0) {
            current = this.RemoveFromOpen(queue, open);
            if (this.InRange(current.pos, dest, range) || i === steps) {
                found = true;
                break;
            }
            this.ShowSearch(current.pos, color_red);
            (_a = this.m_Grid) === null || _a === void 0 ? void 0 : _a.SetGridPosition(current.pos.x, current.pos.y);
            const node_list = this.GetNodesList();
            for (let node of node_list) {
                const is_walkable = (_b = this.m_Grid) === null || _b === void 0 ? void 0 : _b.IsWalkable(node.point.x, node.point.y);
                if (is_walkable) {
                    let g_val = this.G(node.point) + current.G;
                    let h_val = this.H(node.point, dest);
                    let f_val = g_val + h_val;
                    const surrounding_node = this.m_Grid.GetGridNodeAt(node.point.x, node.point.y);
                    const is_closed = close.has(surrounding_node);
                    const is_opened = open.has(surrounding_node);
                    if (g_val < surrounding_node.G) {
                        this.ShowSearch(node.point);
                        surrounding_node.dir = node.dir;
                        surrounding_node.parent = current;
                        surrounding_node.G = g_val;
                        surrounding_node.H = h_val;
                        surrounding_node.F = f_val;
                    }
                    if (!is_opened && !is_closed) {
                        this.AddToOpen(queue, open, surrounding_node);
                    }
                }
            }
            close.set(current, undefined);
            i++;
        }
        return found ? this.CreatePath(current) : new Array(15);
    }
    GetPath(creep) {
        const path = HardDrive_1.HardDrive.Join(creep.GetPath(), "path");
        return HardDrive_1.HardDrive.ReadFolder(path);
    }
    SavePath(creep, data) {
        console.log("saving nav path");
        const path = HardDrive_1.HardDrive.Join(creep.GetPath(), "path");
        HardDrive_1.HardDrive.WriteFiles(path, data);
    }
    MarkPathAsUsed(array) {
        var _a;
        for (let i = 0; i < array.length; i++) {
            const spot = array[i];
            if (spot) {
                (_a = this.m_Grid) === null || _a === void 0 ? void 0 : _a.MarkSpotAsUsed(spot.p.x, spot.p.y);
            }
        }
    }
    GeneratePath(wrapper, obj, dist = 1) {
        const creep = wrapper.GetCreep();
        let path_generated = -1;
        if (creep) {
            const obj_point = this.GetPoint(obj);
            const creep_point = this.GetPoint(creep);
            if (!this.InRange(creep_point, obj_point, dist)) {
                const start_node = {
                    G: 0,
                    H: 0,
                    F: 0,
                    pos: creep_point
                };
                const data = this.GetPath(wrapper);
                let path_array = data.steps;
                let path_index = data.index;
                if (!path_array) {
                    path_array = [];
                }
                if (path_array.length === 0) {
                    path_generated = 1;
                    const grid_key = creep.room.name;
                    if (!InRoomPathFinder.m_Room_grids.has(grid_key)) {
                        InRoomPathFinder.m_Room_grids.set(grid_key, new RoomGrid_1.InRoomGrid(grid_key));
                    }
                    this.m_Grid = InRoomPathFinder.m_Room_grids.get(grid_key);
                    const steps = Number.MAX_SAFE_INTEGER;
                    path_index = 0;
                    //const path = this.CalculatePath(start_node, obj_point, dist, creep, steps)
                    const path = creep.pos.findPathTo(obj, { maxRooms: 1 });
                    //path_array = path.map(s => s?.dir ? s.dir : null)
                    let directions = path.slice(0, path.length - dist).map(s => s.direction);
                    for (let d of directions) {
                        path_array.push(new JsonTreeNode_1.JsonTreeNode(d));
                    }
                }
                else {
                    path_generated = 0;
                }
                this.SavePath(wrapper, {
                    index: path_index,
                    steps: path_array
                });
            }
        }
        return path_generated;
    }
    ClearPath(wrapper) {
        this.SavePath(wrapper, {});
    }
    MoveTo(wrapper) {
        var _a;
        let moved = false;
        const data = this.GetPath(wrapper);
        const creep = wrapper.GetCreep();
        let path_array = data.steps;
        let path_index = data.index;
        if (creep && path_array && ((_a = path_array[0]) === null || _a === void 0 ? void 0 : _a.Type()) === JsonTreeNode_1.NodeTypes.JSON_NUM) {
            const ret = creep.move(path_array[0].GetData());
            if (ret === OK) {
                moved = true;
                path_array.shift();
            }
        }
        else {
            path_array.shift();
        }
        const path_data = {};
        if (path_array !== undefined && path_index !== undefined) {
            path_data.steps = path_array;
            path_data.index = path_index;
        }
        else {
            path_data.steps = [];
            path_data.index = 0;
        }
        this.SavePath(wrapper, path_data);
        return moved;
    }
}
exports.InRoomPathFinder = InRoomPathFinder;
