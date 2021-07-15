"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InRoomGrid = void 0;
const Enums_1 = require("../CompilerTyping/Enums");
class InRoomGrid {
    constructor(room_name) {
        this.m_Grid = new Array();
        this.m_Room_name = room_name;
        this.M_ROAD = Enums_1.TerrainTypes.ROAD_TERRAIN;
        this.M_PLAIN = Enums_1.TerrainTypes.PLAIN_TERRAIN;
        this.M_SWAMP = Enums_1.TerrainTypes.SWAMP_TERRAIN;
        this.M_NOT_WALKABLE = Number.MAX_VALUE;
        this.M_LEFT_EDGE = 0;
        this.M_RIGHT_EDGE = 49;
        this.M_TOP_EDGE = 0;
        this.M_BOTTOM_EDGE = 49;
        this.m_Grid_x = 24;
        this.m_Grid_y = 24;
        this.InitGrid();
    }
    GetTerrainAt(x, y) {
        const room = Game.rooms[this.m_Room_name];
        let tile_type = -1;
        const terrain = room.getTerrain();
        switch (terrain.get(x, y)) {
            case TERRAIN_MASK_SWAMP: {
                tile_type = Enums_1.TerrainTypes.SWAMP_TERRAIN;
                break;
            }
            case TERRAIN_MASK_WALL: {
                tile_type = Enums_1.TerrainTypes.WALL_TERRAIN;
                break;
            }
            default: {
                tile_type = Enums_1.TerrainTypes.PLAIN_TERRAIN;
                break;
            }
        }
        return tile_type;
    }
    AreNoObsticalsAtPoint(x, y) {
        var _a;
        const room = Game.rooms[this.m_Room_name];
        let no_blocks = true;
        const obsticals_at_pos = room.lookAt(x, y);
        const obstical_struct_types = [
            STRUCTURE_WALL,
            STRUCTURE_EXTENSION,
            STRUCTURE_SPAWN,
            STRUCTURE_CONTROLLER,
            STRUCTURE_TOWER,
            STRUCTURE_LINK,
        ];
        for (let thing of obsticals_at_pos) {
            if (thing.creep) {
                no_blocks = false;
                break;
            }
            for (let st of obstical_struct_types) {
                if (((_a = thing.structure) === null || _a === void 0 ? void 0 : _a.structureType) === st) {
                    no_blocks = false;
                    break;
                }
            }
            if (!no_blocks) {
                break;
            }
        }
        return no_blocks;
    }
    IsTravelableTerrain(x, y) {
        return this.GetTerrainAt(x, y) !== Enums_1.TerrainTypes.WALL_TERRAIN;
    }
    IsWalkable(x, y) {
        let walkable = true;
        if (x === this.M_LEFT_EDGE || x === this.M_RIGHT_EDGE) {
            walkable = false;
        }
        else if (y === this.M_TOP_EDGE || y === this.M_BOTTOM_EDGE) {
            walkable = false;
        }
        else {
            const is_plain = this.IsTravelableTerrain(x, y);
            const spot_clear = this.AreNoObsticalsAtPoint(x, y);
            walkable = is_plain && spot_clear;
        }
        return walkable;
    }
    InitGrid() {
        const room = Game.rooms[this.m_Room_name];
        if (room) {
            for (let x = 0; x < 50; x++) {
                this.m_Grid.push(new Array());
                for (let y = 0; y < 50; y++) {
                    const node = {
                        G: Infinity,
                        H: Infinity,
                        F: Infinity,
                        pos: {
                            x: x,
                            y: y
                        }
                    };
                    this.m_Grid[x].push(node);
                }
            }
        }
    }
    GetCurGridPosition() {
        return this.m_Grid[this.m_Grid_x][this.m_Grid_y];
    }
    GetGridPosition(x, y) {
        return this.m_Grid[x][y];
    }
    SetGridPosition(x, y) {
        this.m_Grid_x = x;
        this.m_Grid_y = y;
    }
    MovePositionUp() {
        return {
            x: this.m_Grid_x,
            y: this.m_Grid_y - 1
        };
    }
    MovePositionDown() {
        return {
            x: this.m_Grid_x,
            y: this.m_Grid_y + 1
        };
    }
    MovePositionLeft() {
        return {
            x: this.m_Grid_x - 1,
            y: this.m_Grid_y
        };
    }
    MovePostionRight() {
        return {
            x: this.m_Grid_x + 1,
            y: this.m_Grid_y
        };
    }
    MovePositionUpLeft() {
        const y = this.MovePositionUp().y;
        const x = this.MovePositionLeft().x;
        return {
            x: x,
            y: y
        };
    }
    MovePositionUpRight() {
        const y = this.MovePositionUp().y;
        const x = this.MovePostionRight().x;
        return {
            x: x,
            y: y
        };
    }
    MovePositionDownLeft() {
        const y = this.MovePositionDown().y;
        const x = this.MovePositionLeft().x;
        return {
            x: x,
            y: y
        };
    }
    MovePositionDownRight() {
        const y = this.MovePositionDown().y;
        const x = this.MovePostionRight().x;
        return {
            x: x,
            y: y
        };
    }
}
exports.InRoomGrid = InRoomGrid;
