"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanLayer = void 0;
const RoomGrid_1 = require("../navigation/RoomGrid");
class PlanLayer {
    constructor(corners, room_name) {
        this.m_Corners = corners;
        this.m_Cur_point = null;
        this.m_Grid = new RoomGrid_1.InRoomGrid(room_name);
        this.m_Shift = false;
    }
    MakePerimeter(room) {
        const first_corner = this.m_Corners[0];
        const second_corner = this.m_Corners[1];
        const third_corner = this.m_Corners[2];
        const fourth_corner = this.m_Corners[3];
        const cur_corner = {
            x: first_corner.x,
            y: first_corner.y
        };
        const y = fourth_corner.y - first_corner.y;
        const x = fourth_corner.x - first_corner.x;
        const build_sites = room.GetConstructionSites();
        let beginning_of_side = true;
        let end_of_side = true;
        // creates a square made of barriers row by row (kinda like printing a square)
        for (let column = 0; column <= y; column++) {
            let type = STRUCTURE_WALL;
            for (let row = 0; row <= x; row++) {
                if ((beginning_of_side && row === 0) || (end_of_side && row === x)) {
                    type = STRUCTURE_RAMPART;
                }
                if (this.m_Grid.IsWalkable(x, y)) {
                    const site = build_sites.find(s => s.pos.x === x && s.pos.y === y);
                    site === null || site === void 0 ? void 0 : site.remove();
                    const MakeBarriar = () => {
                        if (row === 0) {
                            beginning_of_side = room.CreateConstructionSite(cur_corner.x, cur_corner.y, type) !== OK;
                        }
                        else if (row === x) {
                            end_of_side = room.CreateConstructionSite(cur_corner.x, cur_corner.y, type) !== OK;
                        }
                        else {
                            room.CreateConstructionSite(cur_corner.x, cur_corner.y, type);
                        }
                    };
                    // builds horizontal lines of a square
                    if (cur_corner.y === first_corner.y || cur_corner.y === third_corner.y) {
                        MakeBarriar();
                    }
                    // builds virtical lines of square
                    else if (cur_corner.x === first_corner.x || cur_corner.x === second_corner.x) {
                        MakeBarriar();
                    }
                    // teleports to last x pos to save on looping iterations
                    else {
                        cur_corner.x = second_corner.x;
                        room.CreateConstructionSite(cur_corner.x, cur_corner.y, type);
                        break;
                    }
                    type = STRUCTURE_WALL;
                }
                cur_corner.x++;
            }
            cur_corner.x = first_corner.x;
            cur_corner.y++;
        }
    }
    PointNear(cur, spot) {
        let near_spot = false;
        // checks if the point is to either side
        if (cur.x === spot.pos.x - 1 || cur.x === spot.pos.x + 1 || cur.x === spot.pos.x) {
            // checks to see if point is above or below
            if (cur.y === spot.pos.y - 1 || cur.y === spot.pos.y + 1 || cur.y === spot.pos.y) {
                near_spot = true;
            }
        }
        return near_spot;
    }
    SetStructure(room, type) {
        if (!this.m_Cur_point) {
            this.m_Cur_point = {
                x: this.m_Corners[0].x + 1,
                y: this.m_Corners[0].y + 1
            };
        }
        else {
            this.m_Cur_point.x += 2;
        }
        let was_placed = 0;
        debugger;
        const sources = room.GetSources();
        const ramparts = room.GetOwnedStructures(STRUCTURE_RAMPART);
        const near_source = sources.some(v => this.PointNear(this.m_Cur_point, v));
        const near_rampart = ramparts.some(r => this.PointNear(this.m_Cur_point, r));
        if (this.m_Cur_point.x < this.m_Corners[0].x || this.m_Cur_point.x > this.m_Corners[1].x) {
            was_placed = 0;
            this.m_Cur_point.x = this.m_Corners[0].x + 1;
            this.m_Cur_point.y++;
            this.m_Shift = !this.m_Shift;
        }
        else if (this.m_Cur_point.y < this.m_Corners[0].y || this.m_Cur_point.y > this.m_Corners[2].y) {
            was_placed = -1;
        }
        if (was_placed !== -1 && !near_source && !near_rampart) {
            const cur_x = this.m_Cur_point.x + Number(this.m_Shift);
            const cur_y = this.m_Cur_point.y;
            if (cur_x > this.m_Corners[0].x && cur_x < this.m_Corners[1].x) {
                was_placed = Number(room.CreateConstructionSite(cur_x, cur_y, type) === OK);
            }
        }
        return was_placed;
    }
    PlaceAtLeftWall(room, type) {
    }
    PlaceAtRightWall(room, type) {
    }
    PlaceAtTopWall(room, type) {
    }
    PlaceAtBottomWall(room, type) {
    }
}
exports.PlanLayer = PlanLayer;
