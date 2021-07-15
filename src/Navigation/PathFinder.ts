import path from "path/posix";
import { TerrainTypes } from "../CompilerTyping/Enums";
import { GridNode, GridNodePoint, JsonObj, Point } from "../CompilerTyping/Interfaces";
import { RoomPos, RoomPosObj } from "../CompilerTyping/Types";
import { PriorityQueue } from "../DataStructures/PriorityQueue";
import { HardDrive } from "../Disk/HardDrive";
import { InRoomGrid } from "./PathGrid";

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

export class InRoomPathFinder {
    private static m_Room_grids: Map<string, InRoomGrid>

    private m_Grid: InRoomGrid | null = null
    private m_Searched_nodes: Array<Point>
    private m_Node_maps: Map<GridNode, GridNode>
    

    constructor() {
        this.m_Searched_nodes = new Array()
        this.m_Node_maps = new Map()

        InRoomPathFinder.m_Room_grids = new Map()
    }

    private GetPoint(obj: RoomPos) {
        let x = (obj as RoomPosObj).pos.x
        let y = (obj as RoomPosObj).pos.y

        if (typeof x !== 'number') {
            x = (obj as RoomPosition).x
        }

        if (typeof y !== 'number') {
            y = (obj as RoomPosition).y
        }

        return {
            x: x,
            y: y
        }
    }

    private GetNodesList(): Array<GridNodePoint> {
        return [
            {
                point: this.m_Grid!!.MovePositionUp(),
                dir: TOP
            },
            {
                point: this.m_Grid!!.MovePositionUpRight(),
                dir: TOP_RIGHT
            },
            {
                point: this.m_Grid!!.MovePostionRight(),
                dir: RIGHT
            },
            {
                point: this.m_Grid!!.MovePositionDownRight(),
                dir: BOTTOM_RIGHT
            },
            {
                point: this.m_Grid!!.MovePositionDown(),
                dir: BOTTOM
            },
            {
                point: this.m_Grid!!.MovePositionDownLeft(),
                dir: BOTTOM_LEFT
            },
            {
                point: this.m_Grid!!.MovePositionLeft(),
                dir: LEFT
            },
            {
                point: this.m_Grid!!.MovePositionUpLeft(),
                dir: TOP_LEFT
            }
        ]
    }

    private H(p1: Point, p2: Point) {
        const x = Math.pow(p2.x - p1.x, 2)
        const y = Math.pow(p2.y - p1.y, 2)
        return Math.sqrt(x + y)
    }

    private G(p: Point) {
        const terrain_type = this.m_Grid!!.GetTerrainAt(p.x, p.y)
        let ret = Infinity

        switch (terrain_type) {
            case TerrainTypes.PLAIN_TERRAIN: {
                ret = TerrainTypes.PLAIN_TERRAIN
                break
            }
            case TerrainTypes.SWAMP_TERRAIN: {
                ret = TerrainTypes.SWAMP_TERRAIN
                break
            }
        }

        return ret
    }



    private GetQueue() {

        const sort_by_h = (a: GridNode, b: GridNode) => {
            let ret = 0

            if (a.H > b.H) {
                ret = -1
            }
            else if (a.H < b.H) {
                ret = 1
            }

            return ret
        }

        const sort_algo = (a: GridNode, b: GridNode) => {
            let ret = 0
            if (a.F > b.F) {
                ret = 1
            }
            else if (a.F < b.F) {
                ret = -1
            }
            else {
                ret = sort_by_h(a, b)
            }
            return ret
        }

        const queue = new PriorityQueue<GridNode>(sort_algo)

        return queue
    }

    private GetDirName(d: DirectionConstant) {
        let name = ""

        switch (d) {
            case TOP: {
                name = 'TOP'
                break
            }
            case TOP_LEFT: {
                name = 'TOP LEFT'
                break
            }
            case LEFT: {
                name = 'LEFT'
                break
            }
            case BOTTOM_LEFT: {
                name = 'BOTTOM LEFT'
                break
            }
            case BOTTOM: {
                name = 'BOTTOM'
                break
            }
            case BOTTOM_RIGHT: {
                name = 'BOTTOM RIGHT'
                break
            }
            case RIGHT: {
                name = 'RIGHT'
                break
            }
            case TOP_RIGHT: {
                name = 'TOP RIGHT'
                break
            }

        }

        return name
    }

    private InRange(p1: Point, p2: Point, range: number) {
        const r_x = Math.abs(p1.x - p2.x)
        const r_y = Math.abs(p1.y - p2.y)

        return r_x <= range && r_y <= range
    }

    private NodeInArray(array: Array<GridNode>, p: Point) {
        let found = false

        for (let el of array) {
            if (el.pos.x === p.x && el.pos.y === p.y) {
                found = true
            }
        }

        return found
    }

    private CreatePath(current: GridNode | undefined): Array<DirectionConstant> {
        const path = new Array<DirectionConstant>()
        debugger

        while (current) {
            if (current.dir) {
                path.unshift(current.dir)
            }
            current = this.m_Node_maps.get(current)
        }

        return path
    }

    private CalculatePath(
        cur_node: GridNode,
        dest: Point,
        range: number,
        creep: Creep,
        steps: number = 10
    ) {
        debugger
        let path = new Array<DirectionConstant>()

        const open = this.GetQueue()
        const closed = new Array<GridNode>()

        open.Push(cur_node)

        while (open.Size() > 0) {
            let current = open.Pop()!!
            closed.push(current)
            if (this.InRange(current.pos, dest, range)) {
                path = this.CreatePath(current)
                break
            }
            debugger

            this.m_Grid?.SetGridPosition(current.pos.x, current.pos.y)
            const node_list = this.GetNodesList()

            for (let node of node_list) {
                let g_val = this.G(node.point)

                if (g_val < Infinity) {
                    g_val += current.G
                    let h_val = this.H(node.point, dest)
                    let f_val = g_val + h_val

                    const n = this.m_Grid!!.GetGridPosition(node.point.x, node.point.y)

                    if (f_val < n.F && this.m_Grid?.IsWalkable(node.point.x, node.point.y)) {

                        this.m_Node_maps.set(n, current)
                        n.G = g_val
                        n.H = h_val
                        n.F = f_val

                        n.dir = node.dir

                        if (!this.NodeInArray(open.ToArray(), node.point)) {
                            open.Push(n)
                        }
                    }
                }

            }
        }
        debugger

        return path
    }

    MoveTo(creep: Creep, obj: RoomPos, dist: number = 1): boolean {
        const obj_point = this.GetPoint(obj)
        const creep_point = this.GetPoint(creep)

        let moved = false

        if (!creep.pos.inRangeTo(obj_point.x, obj_point.y, dist)) {


            const start_node: GridNode = {
                G: 0,
                H: 0,
                F: 0,
                pos: creep_point
            }

            let dir

            const data = HardDrive.Read(creep.name)

            const path_array = data.path as Array<DirectionConstant>

            if (path_array === undefined || path_array.length === 0) {
                const grid_key = creep.room.name
                if (!InRoomPathFinder.m_Room_grids.has(grid_key)) {
                    InRoomPathFinder.m_Room_grids.set(grid_key, new InRoomGrid(grid_key))
                }
                this.m_Grid = InRoomPathFinder.m_Room_grids.get(grid_key)!!
                data.path = this.CalculatePath(start_node, obj_point, dist, creep)
                dir = data.path as Array<DirectionConstant>
                
            }
            else {
                dir = data.path as Array<DirectionConstant>
            }

            if (dir.length > 0) {

                const ret = creep.move(dir[0])

                if (ret === OK) {
                    dir.shift()
                    moved = true
                    HardDrive.Write(creep.name, data)
                }
            }

        }

        return moved
    }
}