"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InRoomPathFinder = void 0;
const Enums_1 = require("../CompilerTyping/Enums");
const PriorityQueue_1 = require("../DataStructures/PriorityQueue");
const HardDrive_1 = require("../Disk/HardDrive");
const PathGrid_1 = require("./PathGrid");
class InRoomPathFinder {
    constructor() {
        this.m_Grid = null;
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
            case Enums_1.TerrainTypes.OCCUPIED_TERRAIN: {
                ret = Enums_1.TerrainTypes.OCCUPIED_TERRAIN;
                break;
            }
        }
        return ret;
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
        const path = new Array();
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
        const vis = new RoomVisual("sim");
        const style = {
            fill: color
        };
        vis.circle(pos.x, pos.y, style);
    }
    AddToOpen(queue, map, val) {
        queue.Push(val);
        map.set(val, undefined);
    }
    RemoveFromOpen(queue, map) {
        const current = queue.Pop();
        if (current) {
            map.delete(current);
        }
        return current;
    }
    CalculatePath(cur_node, dest, range, creep, steps = 10) {
        var _a, _b;
        let path = new Array();
        const open = new Map();
        const close = new Map();
        const queue = this.GetQueue();
        const color_red = "#FF0000";
        this.AddToOpen(queue, open, cur_node);
        let i = 0;
        let found = false;
        let current = null;
        while (queue.Size() > 0) {
            current = this.RemoveFromOpen(queue, open);
            if (this.InRange(current.pos, dest, range)) {
                found = true;
                console.log("could find path", creep.name);
                break;
            }
            else if (i === steps) {
                console.log("couldn't find path");
                break;
            }
            else {
                i++;
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
                    const surrounding_node = this.m_Grid.GetGridPosition(node.point.x, node.point.y);
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
        }
        if (!found) {
            while (path.length < 15) {
                path.push(null);
            }
        }
        else {
            path = this.CreatePath(current);
        }
        return path;
    }
    GetPath(creep) {
        return HardDrive_1.HardDrive.Read(creep.name).path;
    }
    SavePath(creep, data) {
        const save_data = HardDrive_1.HardDrive.Read(creep.name);
        save_data.path = {
            steps: data.steps,
            index: data.index
        };
        HardDrive_1.HardDrive.Write(creep.name, save_data);
    }
    MarkPathAsUsed(start_index, array) {
        var _a;
        for (let i = start_index; i < array.length; i++) {
            const spot = array[i];
            if (spot) {
                (_a = this.m_Grid) === null || _a === void 0 ? void 0 : _a.MarkSpotAsUsed(spot.p.x, spot.p.y);
            }
        }
    }
    MoveTo(creep, obj, dist = 1) {
        const obj_point = this.GetPoint(obj);
        const creep_point = this.GetPoint(creep);
        let moved = false;
        if (!this.InRange(creep_point, obj_point, dist)) {
            const start_node = {
                G: 0,
                H: 0,
                F: 0,
                pos: creep_point
            };
            const data = this.GetPath(creep);
            let path_array = data === null || data === void 0 ? void 0 : data.steps;
            let path_index = data === null || data === void 0 ? void 0 : data.index;
            const data_exists = path_array !== undefined;
            console.log(path_array === null || path_array === void 0 ? void 0 : path_array.length);
            debugger;
            if (!path_array) {
                path_array = new Array();
            }
            if (path_array.length === 0) {
                debugger;
                const grid_key = creep.room.name;
                if (!InRoomPathFinder.m_Room_grids.has(grid_key)) {
                    InRoomPathFinder.m_Room_grids.set(grid_key, new PathGrid_1.InRoomGrid(grid_key));
                }
                this.m_Grid = InRoomPathFinder.m_Room_grids.get(grid_key);
                const num_of_search_tiles = this.m_Grid.GetNumOfWalkableTiles();
                const path_steps = this.CalculatePath(start_node, obj_point, dist, creep, num_of_search_tiles);
                path_index = 0;
                for (let node of path_steps) {
                    let direction = null;
                    if (node) {
                        direction = node.dir;
                    }
                    path_array.push(direction);
                }
                this.SavePath(creep, {
                    index: path_index,
                    steps: path_array
                });
            }
            //this.MarkPathAsUsed(path_index, dir)
            console.log(path_array[0]);
            if (path_array[0]) {
                const ret = creep.move(path_array[0]);
                if (ret === OK) {
                    moved = true;
                    path_array.shift();
                }
            }
            else {
                path_array.shift();
            }
        }
        return moved;
    }
}
exports.InRoomPathFinder = InRoomPathFinder;
