"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InRoomPathFinder = void 0;
const Enums_1 = require("../CompilerTyping/Enums");
const PriorityQueue_1 = require("../DataStructures/PriorityQueue");
const HardDrive_1 = require("../Disk/HardDrive");
const PathGrid_1 = require("./PathGrid");
// while (open.Size() > 0) {
//     let cur = open.Pop()!!
//     let current: GridNode = cur
//     closed.push(current)
//     if (this.InRange(current.pos, dest, range)) {
//         break
//     }
//     this.m_Grid?.SetGridPosition(current.pos.x, current.pos.y)
//     const surrounding_nodes = this.GetNodesList()
//     let closest_neighbor: GridNode = {
//         G: Infinity,
//         H: Infinity,
//         F: Infinity,
//         pos: current.pos
//     }
//     for (let node of surrounding_nodes) {
//         let g_val = this.G(node.point)
//         const was_searched = this.NodeInArray(closed, node.point)
//         const not_walkable = g_val === this.m_Grid?.M_NOT_WALKABLE
//         if (!was_searched && !not_walkable) {
//             g_val += current.G
//             const h_val = this.H(node.point, dest)
//             const f_cost = g_val + h_val
//             const in_open = this.NodeInArray(open.ToArray(), closest_neighbor.pos)
//             const lower_f_cost = f_cost < closest_neighbor.F
//             let is_lower_cost = lower_f_cost
//             if (is_lower_cost || !in_open) {
//                 closest_neighbor = {
//                     G: g_val,
//                     H: h_val,
//                     F: f_cost,
//                     pos: node.point,
//                     dir: node.dir
//                 }
//                 current.child = closest_neighbor
//                 closest_neighbor.parent = current
//                 if (!in_open) {
//                     open.Push(closest_neighbor)
//                 }
//             }
//         }
//     }
// }
class InRoomPathFinder {
    constructor() {
        this.m_Grid = null;
        this.m_Searched_nodes = new Array();
        this.m_Node_maps = new Map();
        InRoomPathFinder.m_Room_grids = new Map();
    }
    GetPoint(obj) {
        let x = obj.pos.x;
        let y = obj.pos.y;
        if (typeof x !== 'number') {
            x = obj.x;
        }
        if (typeof y !== 'number') {
            y = obj.y;
        }
        return {
            x: x,
            y: y
        };
    }
    GetNodesList() {
        return [
            {
                point: this.m_Grid.MovePositionUp(),
                dir: TOP
            },
            {
                point: this.m_Grid.MovePositionUpRight(),
                dir: TOP_RIGHT
            },
            {
                point: this.m_Grid.MovePostionRight(),
                dir: RIGHT
            },
            {
                point: this.m_Grid.MovePositionDownRight(),
                dir: BOTTOM_RIGHT
            },
            {
                point: this.m_Grid.MovePositionDown(),
                dir: BOTTOM
            },
            {
                point: this.m_Grid.MovePositionDownLeft(),
                dir: BOTTOM_LEFT
            },
            {
                point: this.m_Grid.MovePositionLeft(),
                dir: LEFT
            },
            {
                point: this.m_Grid.MovePositionUpLeft(),
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
        const terrain_type = this.m_Grid.GetTerrainAt(p.x, p.y);
        let ret = Infinity;
        switch (terrain_type) {
            case Enums_1.TerrainTypes.PLAIN_TERRAIN: {
                ret = Enums_1.TerrainTypes.PLAIN_TERRAIN;
                break;
            }
            case Enums_1.TerrainTypes.SWAMP_TERRAIN: {
                ret = Enums_1.TerrainTypes.SWAMP_TERRAIN;
                break;
            }
        }
        return ret;
    }
    GetQueue() {
        const sort_by_h = (a, b) => {
            let ret = 0;
            if (a.H > b.H) {
                ret = -1;
            }
            else if (a.H < b.H) {
                ret = 1;
            }
            return ret;
        };
        const sort_algo = (a, b) => {
            let ret = 0;
            if (a.F > b.F) {
                ret = 1;
            }
            else if (a.F < b.F) {
                ret = -1;
            }
            else {
                ret = sort_by_h(a, b);
            }
            return ret;
        };
        const queue = new PriorityQueue_1.PriorityQueue(sort_algo);
        return queue;
    }
    GetDirName(d) {
        let name = "";
        switch (d) {
            case TOP: {
                name = 'TOP';
                break;
            }
            case TOP_LEFT: {
                name = 'TOP LEFT';
                break;
            }
            case LEFT: {
                name = 'LEFT';
                break;
            }
            case BOTTOM_LEFT: {
                name = 'BOTTOM LEFT';
                break;
            }
            case BOTTOM: {
                name = 'BOTTOM';
                break;
            }
            case BOTTOM_RIGHT: {
                name = 'BOTTOM RIGHT';
                break;
            }
            case RIGHT: {
                name = 'RIGHT';
                break;
            }
            case TOP_RIGHT: {
                name = 'TOP RIGHT';
                break;
            }
        }
        return name;
    }
    InRange(p1, p2, range) {
        const r_x = Math.abs(p1.x - p2.x);
        const r_y = Math.abs(p1.y - p2.y);
        return r_x <= range && r_y <= range;
    }
    NodeInArray(array, p) {
        let found = false;
        for (let el of array) {
            if (el.pos.x === p.x && el.pos.y === p.y) {
                found = true;
            }
        }
        return found;
    }
    CreatePath(current) {
        const path = new Array();
        debugger;
        while (current) {
            if (current.dir) {
                path.unshift(current.dir);
            }
            current = this.m_Node_maps.get(current);
        }
        return path;
    }
    CalculatePath(cur_node, dest, range, creep, steps = 10) {
        var _a, _b;
        debugger;
        let path = new Array();
        const open = this.GetQueue();
        const closed = new Array();
        open.Push(cur_node);
        while (open.Size() > 0) {
            let current = open.Pop();
            closed.push(current);
            if (this.InRange(current.pos, dest, range)) {
                path = this.CreatePath(current);
                break;
            }
            debugger;
            (_a = this.m_Grid) === null || _a === void 0 ? void 0 : _a.SetGridPosition(current.pos.x, current.pos.y);
            const node_list = this.GetNodesList();
            for (let node of node_list) {
                let g_val = this.G(node.point);
                if (g_val < Infinity) {
                    g_val += current.G;
                    let h_val = this.H(node.point, dest);
                    let f_val = g_val + h_val;
                    const n = this.m_Grid.GetGridPosition(node.point.x, node.point.y);
                    if (f_val < n.F && ((_b = this.m_Grid) === null || _b === void 0 ? void 0 : _b.IsWalkable(node.point.x, node.point.y))) {
                        this.m_Node_maps.set(n, current);
                        n.G = g_val;
                        n.H = h_val;
                        n.F = f_val;
                        n.dir = node.dir;
                        if (!this.NodeInArray(open.ToArray(), node.point)) {
                            open.Push(n);
                        }
                    }
                }
            }
        }
        debugger;
        return path;
    }
    MoveTo(creep, obj, dist = 1) {
        const obj_point = this.GetPoint(obj);
        const creep_point = this.GetPoint(creep);
        let moved = false;
        if (!creep.pos.inRangeTo(obj_point.x, obj_point.y, dist)) {
            const start_node = {
                G: 0,
                H: 0,
                F: 0,
                pos: creep_point
            };
            let dir;
            const data = HardDrive_1.HardDrive.Read(creep.name);
            const path_array = data.path;
            if (path_array === undefined || path_array.length === 0) {
                const grid_key = creep.room.name;
                if (!InRoomPathFinder.m_Room_grids.has(grid_key)) {
                    InRoomPathFinder.m_Room_grids.set(grid_key, new PathGrid_1.InRoomGrid(grid_key));
                }
                this.m_Grid = InRoomPathFinder.m_Room_grids.get(grid_key);
                data.path = this.CalculatePath(start_node, obj_point, dist, creep);
                dir = data.path;
            }
            else {
                dir = data.path;
            }
            if (dir.length > 0) {
                const ret = creep.move(dir[0]);
                if (ret === OK) {
                    dir.shift();
                    moved = true;
                    HardDrive_1.HardDrive.Write(creep.name, data);
                }
            }
        }
        return moved;
    }
}
exports.InRoomPathFinder = InRoomPathFinder;
