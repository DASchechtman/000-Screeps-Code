"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InRoomGrid = void 0;
const Enums_1 = require("./Enums");
class InRoomGrid {
    constructor(room_name) {
        this.m_Grid = new Array();
        this.m_Nodes_used = new Map();
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
        this.m_Walkable_tile_num = 0;
        this.InitGrid();
    }
    GetRoadOnTile(x, y, original_val) {
        var _a;
        const room = Game.rooms[this.m_Room_name];
        if (room) {
            const objects_at_point = room.lookAt(x, y);
            for (let object of objects_at_point) {
                if (((_a = object.structure) === null || _a === void 0 ? void 0 : _a.structureType) === STRUCTURE_ROAD) {
                    original_val = Enums_1.TerrainTypes.ROAD_TERRAIN;
                    break;
                }
            }
        }
        return original_val;
    }
    IsWalkableStructure(struct) {
        let no_blocks = true;
        const walkable_structs = [
            STRUCTURE_ROAD,
            STRUCTURE_RAMPART,
            STRUCTURE_CONTAINER
        ];
        for (let st of walkable_structs) {
            if (struct.structureType !== st) {
                no_blocks = false;
                break;
            }
            else if (struct.structureType !== st) {
                no_blocks = false;
                break;
            }
        }
        return no_blocks;
    }
    IsTravelableTerrain(x, y) {
        return this.GetTerrainAt(x, y) !== Enums_1.TerrainTypes.WALL_TERRAIN;
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
                    if (this.IsWalkable(x, y)) {
                        this.m_Walkable_tile_num++;
                    }
                }
            }
        }
    }
    CoordToString(x, y) {
        return `${x},${y}`;
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
        tile_type = this.GetRoadOnTile(x, y, tile_type);
        if (this.SpotIsUsed(x, y)) {
            tile_type = Enums_1.TerrainTypes.OCCUPIED_TERRAIN;
        }
        return tile_type;
    }
    AreNoObsticalsAtPoint(x, y) {
        const room = Game.rooms[this.m_Room_name];
        let no_blocks = true;
        const obsticals_at_pos = room.lookAt(x, y);
        for (let thing of obsticals_at_pos) {
            if (thing.creep) {
                no_blocks = false;
            }
            else if (thing.structure) {
                no_blocks = this.IsWalkableStructure(thing.structure);
            }
            else if (thing.constructionSite) {
                no_blocks = this.IsWalkableStructure(thing.constructionSite);
            }
            if (!no_blocks) {
                break;
            }
        }
        return no_blocks;
    }
    MarkSpotAsUsed(x, y) {
        const spot_string = this.CoordToString(x, y);
        this.m_Nodes_used.set(spot_string, undefined);
    }
    SpotIsUsed(x, y) {
        const spot_string = this.CoordToString(x, y);
        return this.m_Nodes_used.has(spot_string);
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
    GetNumOfWalkableTiles() {
        return this.m_Walkable_tile_num;
    }
}
exports.InRoomGrid = InRoomGrid;
