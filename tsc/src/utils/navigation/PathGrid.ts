import { TerrainTypes } from "../../types/Enums"
import { GridNode, GridNodeData, Point } from "../../types/Interfaces"


export class InRoomGrid {

    readonly M_NOT_WALKABLE: number

    readonly M_SWAMP: number
    readonly M_PLAIN: number
    readonly M_ROAD: number

    private readonly M_LEFT_EDGE: number
    private readonly M_RIGHT_EDGE: number
    private readonly M_TOP_EDGE: number
    private readonly M_BOTTOM_EDGE: number

    private m_Grid: Map<number, Map<number, GridNodeData>>
    private m_Room_name: string
    private m_Grid_x: number
    private m_Grid_y: number
    private m_Walkable_tile_num: number

    constructor(room_name: string) {
        this.m_Room_name = room_name

        this.M_ROAD = TerrainTypes.ROAD_TERRAIN
        this.M_PLAIN = TerrainTypes.PLAIN_TERRAIN
        this.M_SWAMP = TerrainTypes.SWAMP_TERRAIN
        this.M_NOT_WALKABLE = Number.MAX_VALUE

        this.M_LEFT_EDGE = 0
        this.M_RIGHT_EDGE = 49
        this.M_TOP_EDGE = 0
        this.M_BOTTOM_EDGE = 49

        this.m_Grid_x = 24
        this.m_Grid_y = 24
        this.m_Walkable_tile_num = 0

        this.m_Grid = new Map()
    }

    private GetRoadOnTile(x: number, y: number): boolean {
        const room = Game.rooms[this.m_Room_name]
        let has_road = false

        if (room) {
            const objects_at_point = room.lookAt(x, y)

            for (let object of objects_at_point) {
                if (!object.structure) {
                    break
                }
                if (object.structure?.structureType === STRUCTURE_ROAD) {
                    has_road = true
                    break
                }
            }
        }

        return has_road
    }

    private IsWalkableStructure(struct: Structure | ConstructionSite): boolean {
        const walkable_structs: StructureConstant[] = [
            STRUCTURE_ROAD,
            STRUCTURE_RAMPART,
            STRUCTURE_CONTAINER
        ]

        return walkable_structs.includes(struct.structureType)
    }

    private IsTravelableTerrain(x: number, y: number): boolean {
        return this.GetTerrainAt(x, y) !== TerrainTypes.WALL_TERRAIN
    }

    private IsWalkableTile(x: number, y: number): boolean {
        let walkable = true

        if (x === this.M_LEFT_EDGE || x === this.M_RIGHT_EDGE) {
            walkable = false
        }
        else if (y === this.M_TOP_EDGE || y === this.M_BOTTOM_EDGE) {
            walkable = false
        }
        else {
            const is_plain = this.IsTravelableTerrain(x, y)
            const spot_clear = this.AreNoObsticalsAtPoint(x, y)
            walkable = is_plain && spot_clear
        }

        return walkable
    }

    private GetCell(x: number, y: number): GridNodeData {
        if (!this.m_Grid.has(x)) {
            this.m_Grid.set(x, new Map())
        }

        if (!this.m_Grid.get(x)!!.has(y)) {
            const node: GridNodeData = {
                node: {
                    G: Infinity,
                    H: Infinity,
                    F: Infinity,
                    pos: {
                        x: x,
                        y: y
                    }
                },
                has_road: false,
                is_walkable: this.IsWalkableTile(x, y)
            }

            if (node.is_walkable) {
                this.m_Walkable_tile_num++
                node.has_road = this.GetRoadOnTile(x, y)
            }

            this.m_Grid.get(x)!!.set(y, node)
        }

        return this.m_Grid.get(x)!!.get(y)!!
    }

    GetTerrainAt(x: number, y: number): number {

        const room = Game.rooms[this.m_Room_name]

        let tile_type = -1
        const terrain = room.getTerrain()

        switch (terrain.get(x, y)) {
            case TERRAIN_MASK_SWAMP: {
                tile_type = TerrainTypes.SWAMP_TERRAIN
                break
            }
            case TERRAIN_MASK_WALL: {
                tile_type = TerrainTypes.WALL_TERRAIN
                break
            }
            default: {
                tile_type = TerrainTypes.PLAIN_TERRAIN
                break
            }
        }

        return tile_type
    }

    HasRoad(x: number, y: number): boolean {
        return this.GetCell(x, y).has_road
    }

    AreNoObsticalsAtPoint(x: number, y: number): boolean {
        const room = Game.rooms[this.m_Room_name]

        let no_blocks = true
        const obsticals_at_pos = room.lookAt(x, y)

        for (let thing of obsticals_at_pos) {
            if (thing.creep) {
                no_blocks = false
            }
            else if (thing.structure) {
                no_blocks = this.IsWalkableStructure(thing.structure)
            }
            else if (thing.constructionSite) {
                no_blocks = this.IsWalkableStructure(thing.constructionSite)
            }
            else if (thing.source) {
                no_blocks = false
            }


            if (!no_blocks) {
                break
            }
        }

        return no_blocks
    }

    MarkSpotAsUsed(x: number, y: number): void {
        this.GetCell(x, y).creep_on_tile = true
    }

    SpotIsUsed(x: number, y: number): boolean {
        const is_used = this.GetCell(x, y).creep_on_tile
        return Boolean(is_used)
    }

    IsWalkable(x: number, y: number): boolean {
        return this.GetCell(x, y).is_walkable
    }

    GetGridNode(): GridNode {
        return this.GetCell(this.m_Grid_x, this.m_Grid_y).node
    }

    GetGridNodeAt(x: number, y: number): GridNode {
        return this.GetCell(x, y).node
    }

    SetGridPosition(x: number, y: number): void {
        this.m_Grid_x = x
        this.m_Grid_y = y
    }

    GetPositionTop(): Point {
        return {
            x: this.m_Grid_x,
            y: this.m_Grid_y - 1
        }
    }

    GetPositionBottom(): Point {
        return {
            x: this.m_Grid_x,
            y: this.m_Grid_y + 1
        }
    }

    GetPositionLeft(): Point {
        return {
            x: this.m_Grid_x - 1,
            y: this.m_Grid_y
        }
    }

    GetPostionRight(): Point {
        return {
            x: this.m_Grid_x + 1,
            y: this.m_Grid_y
        }
    }

    GetPositionTopLeft(): Point {
        const y = this.GetPositionTop().y
        const x = this.GetPositionLeft().x
        return {
            x: x,
            y: y
        }
    }

    GetPositionTopRight(): Point {
        const y = this.GetPositionTop().y
        const x = this.GetPostionRight().x
        return {
            x: x,
            y: y
        }
    }

    GetPositionBottomLeft(): Point {
        const y = this.GetPositionBottom().y
        const x = this.GetPositionLeft().x
        return {
            x: x,
            y: y
        }
    }

    GetPositionBottomRight(): Point {
        const y = this.GetPositionBottom().y
        const x = this.GetPostionRight().x
        return {
            x: x,
            y: y
        }
    }

    GetNumOfWalkableTiles(): number {
        return this.m_Walkable_tile_num
    }
    GetRoomName(): string {
        return this.m_Room_name
    }
}