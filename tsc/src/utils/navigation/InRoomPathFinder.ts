import path from "path/posix"
import { DEFENSE_DEV_LEVELS } from "../../consts/GameConstants"
import { CreepWrapper } from "../../core/CreepWrapper"
import { RoomWrapper } from "../../core/room/RoomWrapper"
import { TerrainTypes } from "../../types/Enums"
import { GridNode, GridNodePoint, JsonObj, Point } from "../../types/Interfaces"
import { RoomPos, RoomPosObj } from "../../types/Types"
import { PriorityQueue } from "../datastructures/PriorityQueue"
import { HardDrive } from "../harddrive/HardDrive"
import { InRoomGrid } from "./RoomGrid"


export class InRoomPathFinder {
    private static m_Room_grids: Map<string, InRoomGrid>
    private m_Grid: InRoomGrid | null = null
    private m_Generator: Generator<{ dir: DirectionConstant, p: Point } | Point[] | undefined> | null = null


    constructor() {
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

    private GetNodesList(): GridNodePoint[] {
        return [
            {
                point: this.m_Grid!!.GetPositionTop(),
                dir: TOP
            },
            {
                point: this.m_Grid!!.GetPositionTopRight(),
                dir: TOP_RIGHT
            },
            {
                point: this.m_Grid!!.GetPostionRight(),
                dir: RIGHT
            },
            {
                point: this.m_Grid!!.GetPositionBottomRight(),
                dir: BOTTOM_RIGHT
            },
            {
                point: this.m_Grid!!.GetPositionBottom(),
                dir: BOTTOM
            },
            {
                point: this.m_Grid!!.GetPositionBottomLeft(),
                dir: BOTTOM_LEFT
            },
            {
                point: this.m_Grid!!.GetPositionLeft(),
                dir: LEFT
            },
            {
                point: this.m_Grid!!.GetPositionTopLeft(),
                dir: TOP_LEFT
            }
        ]
    }

    private H(p1: Point, p2: Point) {
        const x = Math.pow(p2.x - p1.x, 2)
        const y = Math.pow(p2.y - p1.y, 2)
        return Math.sqrt(x + y)
    }

    private G(p: Point): number {
        let terrain_type: number = this.m_Grid!!.GetTerrainAt(p.x, p.y)

        if (this.m_Grid?.SpotIsUsed(p.x, p.y)) {
            terrain_type = TerrainTypes.OCCUPIED_TERRAIN
        }
        else if (this.m_Grid?.HasRoad(p.x, p.y)) {
            terrain_type = TerrainTypes.ROAD_TERRAIN
        }
        return terrain_type
    }



    private GetQueue() {

        const sort_algo = (el: GridNode): number => {
            return el.F
        }

        const queue = new PriorityQueue<GridNode>(sort_algo)

        return queue
    }

    private InRange(p1: Point, p2: Point, range: number) {
        const r_x = Math.abs(p1.x - p2.x)
        const r_y = Math.abs(p1.y - p2.y)
        return r_x <= range && r_y <= range
    }

    private CreatePath(current: GridNode | null | undefined): { dir: DirectionConstant, p: Point }[] {
        const path: { dir: DirectionConstant, p: Point }[] = []
        const color_blue = "#ADD8E6"

        while (current) {
            if (current.dir) {
                path.unshift({ dir: current.dir, p: current.pos })
            }
            this.ShowSearch(current.pos, color_blue)
            current = current.parent
        }

        return path
    }

    private ShowSearch(pos: Point, color: string = "#00FF00") {
        const vis = new RoomVisual(this.m_Grid!!.GetRoomName())
        const style: CircleStyle = {
            fill: color
        }

        vis.circle(pos.x, pos.y, style)
    }

    private AddToOpen(queue: PriorityQueue<GridNode>, map: Map<GridNode, undefined>, val: GridNode) {
        queue.Push(val)
        map.set(val, undefined)
    }

    private Clear(queue: PriorityQueue<GridNode>, open: Map<GridNode, undefined>, close: Map<GridNode, undefined>): void {
        queue.Clear()
        open.clear()
        close.clear()
    }

    private RemoveFromOpen(queue: PriorityQueue<GridNode>, map: Map<GridNode, undefined>): GridNode | null {
        const current = queue.Pop()
        if (current) {
            map.delete(current)
        }
        return current;
    }

    private CalculatePath(
        cur_node: GridNode,
        dest: Point,
        range: number,
        creep: Creep,
        steps: number
    ): ({ dir: DirectionConstant, p: Point } | undefined)[] {

        const open = new Map<GridNode, undefined>()
        const close = new Map<GridNode, undefined>()
        const queue = this.GetQueue()
        const color_red = "#FF0000"
        let found = false

        this.AddToOpen(queue, open, cur_node)
        let i = 0
        let current: GridNode | null = null
        while (queue.Size() > 0) {
            current = this.RemoveFromOpen(queue, open)!!

            if (this.InRange(current.pos, dest, range) || i === steps) {
                found = true
                break
            }

            this.ShowSearch(current.pos, color_red)

            this.m_Grid?.SetGridPosition(current.pos.x, current.pos.y)
            const node_list = this.GetNodesList()
            for (let node of node_list) {
                const is_walkable = this.m_Grid?.IsWalkable(node.point.x, node.point.y)

                if (is_walkable) {
                    let g_val = this.G(node.point) + current.G
                    let h_val = this.H(node.point, dest)
                    let f_val = g_val + h_val

                    const surrounding_node = this.m_Grid!!.GetGridNodeAt(node.point.x, node.point.y)
                    const is_closed = close.has(surrounding_node)
                    const is_opened = open.has(surrounding_node)


                    if (g_val < surrounding_node.G) {
                        this.ShowSearch(node.point)

                        surrounding_node.dir = node.dir
                        surrounding_node.parent = current

                        surrounding_node.G = g_val
                        surrounding_node.H = h_val
                        surrounding_node.F = f_val
                    }

                    if (!is_opened && !is_closed) {
                        this.AddToOpen(queue, open, surrounding_node)
                    }
                }
            }

            close.set(current, undefined)

            i++
        }

        return found ? this.CreatePath(current) : new Array(15)
    }

    private GetPath(creep: CreepWrapper): JsonObj {
        const path = HardDrive.Join(creep.GetPath(), "path")
        return HardDrive.ReadFolder(path)
    }

    private SavePath(creep: CreepWrapper, data: JsonObj) {
        const path = HardDrive.Join(creep.GetPath(), "path")
        HardDrive.WriteFiles(path, data)
    }

    private MarkPathAsUsed(array: ({ dir: DirectionConstant, p: Point } | null)[]) {
        for (let i = 0; i < array.length; i++) {
            const spot = array[i]
            if (spot) {
                this.m_Grid?.MarkSpotAsUsed(spot.p.x, spot.p.y)
            }
        }
    }

    GeneratePath(wrapper: CreepWrapper, obj: RoomPos, dist: number = 1): number {
        const creep = wrapper.GetCreep()
        let path_generated = -1

        if (creep) {
            const obj_point = this.GetPoint(obj)
            const creep_point = this.GetPoint(creep)

            if (!this.InRange(creep_point, obj_point, dist)) {
                const start_node: GridNode = {
                    G: 0,
                    H: 0,
                    F: 0,
                    pos: creep_point
                }

                const data = this.GetPath(wrapper)

                let path_array = data.steps as (DirectionConstant | null)[]
                let path_index = data.index as number

                if (!path_array) {
                    path_array = []
                }

                if (path_array.length === 0) {
                    // path_generated = 1
                    // const grid_key = creep.room.name
                    // if (!InRoomPathFinder.m_Room_grids.has(grid_key)) {
                    //     InRoomPathFinder.m_Room_grids.set(grid_key, new InRoomGrid(grid_key))
                    // }
                    // this.m_Grid = InRoomPathFinder.m_Room_grids.get(grid_key)!!
                    // const steps = Number.MAX_SAFE_INTEGER
                    // path_index = 0

                    // //const path = this.CalculatePath(start_node, obj_point, dist, creep, steps)

                    // for (let step of path) {
                    //     if (step) {
                    //         path_array.push(step.dir)
                    //         const room = new RoomWrapper(creep.room.name)

                    //         // if (room.GetController() && room.GetController()!!.level >= DEFENSE_DEV_LEVELS) {
                    //         //     creep.room.createConstructionSite(step.p.x, step.p.y, STRUCTURE_ROAD)
                    //         // }
                    //     }
                    //     else {
                    //         path_array.push(null)
                    //     }
                    // }
                    let path = creep.pos.findPathTo(obj, {
                        maxRooms: 1
                    })

                    path_array = path.slice(0, path.length-dist).map(s => s.direction)
                }
                else {
                    path_generated = 0
                }

                this.SavePath(wrapper, {
                    index: path_index,
                    steps: path_array
                })
            }
        }

        return path_generated
    }

    ClearPath(wrapper: CreepWrapper) {
        this.SavePath(wrapper, {})
    }

    MoveTo(wrapper: CreepWrapper): boolean {
        let moved = false

        const data = this.GetPath(wrapper)
        const creep = wrapper.GetCreep()
        let path_array = data.steps as (DirectionConstant | null)[]
        let path_index = data.index as number

        if (creep && path_array && path_array[0]) {
            const ret = creep.move(path_array[0])
            if (ret === OK) {
                moved = true
                path_array.shift()
            }
        }
        else {
            path_array.shift()
        }

        const path_data: JsonObj = {}

        if (path_array !== undefined && path_index !== undefined) {
            path_data.steps = path_array
            path_data.index = path_index
        }
        else {
            path_data.steps = []
            path_data.index = 0
        }

        this.SavePath(wrapper, path_data)

        return moved
    }
}