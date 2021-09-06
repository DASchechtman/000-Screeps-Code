import { DEFENSE_DEV_LEVELS } from "../../consts/GameConstants";
import { RoomWrapper } from "../../core/room/RoomWrapper";
import { Point } from "../../types/Interfaces";
import { InRoomGrid } from "../navigation/RoomGrid";
import { PlanLayer } from "./PlanLayer";

interface BuildInfo {
    type: BuildableStructureConstant,
    amount: number
}

export class ColonyPlanner {
    private static m_Inst: Map<string, ColonyPlanner> = new Map()

    private m_Layers: PlanLayer[]
    private m_Room_name: string
    private m_Struct_list: BuildInfo[]

    private constructor(room_name: string) {
        this.m_Layers = []
        this.m_Room_name = room_name
        this.m_Struct_list = new Array()

        this.m_Struct_list.push({
            type: STRUCTURE_EXTENSION,
            amount: 5
        })
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


    public Build(level: number, spawn_point: Point, room: RoomWrapper): void {
        const corners = this.GetCornersOfSquare(level * DEFENSE_DEV_LEVELS, spawn_point)
        if (this.m_Layers.length === 0) {
            const layer = new PlanLayer(corners, this.m_Room_name)
            layer.MakePerimeter(room)
            this.m_Layers.push(layer)

            for (let i = 0; i < this.m_Struct_list[level-2].amount; i++) {
                layer.SetStructure(room, this.m_Struct_list[level-2].type)
            }
        }
    }
}