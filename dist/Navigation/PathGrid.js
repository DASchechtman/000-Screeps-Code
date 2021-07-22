"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InRoomGrid = void 0;
const Enums_1 = require("../CompilerTyping/Enums");
class InRoomGrid {
    constructor(room_name) {
        this.m_Room_name = room_name;
        this.M_ROAD = Enums_1.TerrainTypes.ROAD_TERRAIN;
        this.M_PLAIN = Enums_1.TerrainTypes.PLAIN_TERRAIN;
        this.M_SWAMP = Enums_1.TerrainTypes.SWAMP_TERRAIN;
        this.M_NOT_WALKABLE = Number.MAX_VALUE;
        this.M_GRID_DEMENSION = 50;
        this.M_LEFT_EDGE = 0;
        this.M_RIGHT_EDGE = 49;
        this.M_TOP_EDGE = 0;
        this.M_BOTTOM_EDGE = 49;
        this.m_Grid_x = 24;
        this.m_Grid_y = 24;
        this.m_Walkable_tile_num = 0;
        this.m_Grid = new Map();
    }
    GetRoadOnTile(x, y) {
        var _a;
        const room = Game.rooms[this.m_Room_name];
        let has_road = false;
        if (room) {
            const objects_at_point = room.lookAt(x, y);
            for (let object of objects_at_point) {
                if (!object.structure) {
                    break;
                }
                if (((_a = object.structure) === null || _a === void 0 ? void 0 : _a.structureType) === STRUCTURE_ROAD) {
                    has_road = true;
                    break;
                }
            }
        }
        return has_road;
    }
    IsWalkableStructure(struct) {
        const walkable_structs = [
            STRUCTURE_ROAD,
            STRUCTURE_RAMPART,
            STRUCTURE_CONTAINER
        ];
        return walkable_structs.includes(struct.structureType);
    }
    IsTravelableTerrain(x, y) {
        return this.GetTerrainAt(x, y) !== Enums_1.TerrainTypes.WALL_TERRAIN;
    }
    IsWalkableTile(x, y) {
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
    InitCell(x, y) {
        if (!this.m_Grid.has(x)) {
            this.m_Grid.set(x, new Map());
        }
        if (!this.m_Grid.get(x).has(y)) {
            const node = {
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
            };
            if (node.is_walkable) {
                this.m_Walkable_tile_num++;
                node.has_road = this.GetRoadOnTile(x, y);
            }
            this.m_Grid.get(x).set(y, node);
        }
        return this.m_Grid.get(x).get(y);
    }
    GetCell(x, y) {
        return this.InitCell(x, y);
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
    HasRoad(x, y) {
        return this.GetCell(x, y).has_road;
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
        this.GetCell(x, y).creep_on_tile = true;
    }
    SpotIsUsed(x, y) {
        const is_used = this.GetCell(x, y).creep_on_tile;
        return Boolean(is_used);
    }
    IsWalkable(x, y) {
        return this.GetCell(x, y).is_walkable;
    }
    GetCurGridPosition() {
        return this.GetCell(this.m_Grid_x, this.m_Grid_y).node;
    }
    GetGridPosition(x, y) {
        return this.GetCell(x, y).node;
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
    GetRoomName() {
        return this.m_Room_name;
    }
}
exports.InRoomGrid = InRoomGrid;
