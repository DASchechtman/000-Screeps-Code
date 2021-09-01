import { RoomWrapper } from "../../core/room/RoomWrapper";
import { Point } from "../../types/Interfaces";
import { InRoomGrid } from "../navigation/RoomGrid";

export class ColonyPlanner {
    private static m_Inst: Map<string, ColonyPlanner> = new Map()

    private m_Grid: InRoomGrid

    private constructor(room_name: string) {
        this.m_Grid = new InRoomGrid(room_name)
    }

    public static GetInst(room_name: string): ColonyPlanner {
        if (!this.m_Inst.has(room_name)) {
            this.m_Inst.set(room_name, new ColonyPlanner(room_name))
        }

        return this.m_Inst.get(room_name)!!
    }

    private GetCornersOfSquare(offset: number, spawn_point: Point): [Point, Point, Point, Point] {
        const corners: [Point, Point, Point, Point] = [
            {
                x: spawn_point.x - offset,
                y: spawn_point.y - offset
            },
            {
                x: spawn_point.x + offset,
                y: spawn_point.y - offset
            },
            {
                x: spawn_point.x - offset,
                y: spawn_point.y + offset
            },
            {
                x: spawn_point.x + offset,
                y: spawn_point.y + offset
            }
        ]

        return corners
    }

    private CreateParameter(corners: [Point, Point, Point, Point], room: RoomWrapper): void {
        const first_corner = corners[0]
        const second_corner = corners[1]
        const third_corner = corners[2]
        const fourth_corner = corners[3]

        const cur_corner: Point = {
            x: first_corner.x,
            y: first_corner.y
        }

        const y = fourth_corner.y - first_corner.y
        const x = fourth_corner.x = first_corner.x

        // creates a square made of barriers row by row (kinda like printing a square)
        for (let column = 0; column < y; column++) {
            for (let row = 0; row < x; row++) {
                // builds horizontal lines of a square
                if (cur_corner.y === first_corner.y || cur_corner.y === third_corner.y) {
                    room.CreateConstructionSite(cur_corner.x, cur_corner.y, STRUCTURE_RAMPART)
                }
                // builds virtical lines of square
                else if (cur_corner.x === first_corner.x || cur_corner.x === second_corner.x) {
                    room.CreateConstructionSite(cur_corner.x, cur_corner.y, STRUCTURE_RAMPART)
                }
                // teleports to last x pos to save on looping iterations
                else {
                    cur_corner.x = second_corner.x
                    room.CreateConstructionSite(cur_corner.x, cur_corner.y, STRUCTURE_RAMPART)
                    break
                }
                cur_corner.x++
            }
            cur_corner.x = first_corner.x
            cur_corner.y++
        }
    }


    public Build(level: number, spawn_point: Point, room: RoomWrapper): void {
        const corners = this.GetCornersOfSquare(level, spawn_point)
        this.CreateParameter(corners, room)
    }
}