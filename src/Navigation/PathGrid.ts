import { runInThisContext } from "vm"
import { TerrainTypes } from "../CompilerTyping/Enums"
import { GridNode, Point } from "../CompilerTyping/Interfaces"

export class InRoomGrid {

    readonly M_NOT_WALKABLE: number

    readonly M_SWAMP: number
    readonly M_PLAIN: number
    readonly M_ROAD: number

    private readonly M_LEFT_EDGE: number
    private readonly M_RIGHT_EDGE: number
    private readonly M_TOP_EDGE: number
    private readonly M_BOTTOM_EDGE: number

    private m_Grid: Array<Array<GridNode>>
    private m_Room_name: string
    private m_Grid_x: number
    private m_Grid_y: number

    constructor(room_name: string) {
        this.m_Grid = new Array()
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

        this.InitGrid()
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

    AreNoObsticalsAtPoint(x: number, y: number): boolean {
        const room = Game.rooms[this.m_Room_name]

        let no_blocks = true
        const obsticals_at_pos = room.lookAt(x, y)

        const obstical_struct_types = [
            STRUCTURE_WALL,
            STRUCTURE_EXTENSION,
            STRUCTURE_SPAWN,
            STRUCTURE_CONTROLLER,
            STRUCTURE_TOWER,
            STRUCTURE_LINK,
        ]

        for (let thing of obsticals_at_pos) {
            if (thing.creep) {
                no_blocks = false
                break
            }
            for (let st of obstical_struct_types) {
                if (thing.structure?.structureType === st) {
                    no_blocks = false
                    break
                }
            }
            if (!no_blocks) {
                break
            }
        }

        return no_blocks
    }

    private IsTravelableTerrain(x: number, y: number): boolean {
        return this.GetTerrainAt(x, y) !== TerrainTypes.WALL_TERRAIN
    }

    IsWalkable(x: number, y: number) {
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


    private InitGrid(): void {
        const room = Game.rooms[this.m_Room_name]

        if (room) {
            for (let x = 0; x < 50; x++) {
                this.m_Grid.push(new Array())
                for (let y = 0; y < 50; y++) {
                    const node: GridNode = {
                        G: Infinity,
                        H: Infinity,
                        F: Infinity,
                        pos: {
                            x: x,
                            y: y
                        }
                    }

                    this.m_Grid[x].push(node)
                }
            }
        }
    }

    GetCurGridPosition() {
        return this.m_Grid[this.m_Grid_x][this.m_Grid_y]
    }

    GetGridPosition(x: number, y: number) {
        return this.m_Grid[x][y]
    }

    SetGridPosition(x: number, y: number): void {
        this.m_Grid_x = x
        this.m_Grid_y = y
    }

    MovePositionUp(): Point {
        return {
            x: this.m_Grid_x,
            y: this.m_Grid_y - 1
        }
    }

    MovePositionDown(): Point {
        return {
            x: this.m_Grid_x,
            y: this.m_Grid_y + 1
        }
    }

    MovePositionLeft(): Point {
        return {
            x: this.m_Grid_x - 1,
            y: this.m_Grid_y
        }
    }

    MovePostionRight(): Point {
        return {
            x: this.m_Grid_x + 1,
            y: this.m_Grid_y
        }
    }

    MovePositionUpLeft(): Point {
        const y = this.MovePositionUp().y
        const x = this.MovePositionLeft().x
        return {
            x: x,
            y: y
        }
    }

    MovePositionUpRight(): Point {
        const y = this.MovePositionUp().y
        const x = this.MovePostionRight().x
        return {
            x: x,
            y: y
        }
    }

    MovePositionDownLeft(): Point {
        const y = this.MovePositionDown().y
        const x = this.MovePositionLeft().x
        return {
            x: x,
            y: y
        }
    }

    MovePositionDownRight(): Point {
        const y = this.MovePositionDown().y
        const x = this.MovePostionRight().x
        return {
            x: x,
            y: y
        }
    }
}