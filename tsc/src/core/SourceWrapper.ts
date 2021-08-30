import { TerrainTypes } from "../types/Enums";
import { Point, SignalMessage } from "../types/Interfaces";
import { ColonyMember } from "./ColonyMember";

export class SourceWrapper {
    private m_Source: Source | undefined = undefined
    private m_Id: Id<Source>

    constructor(id: string) {
        this.m_Id = id as Id<Source>
    }

    private GetSurroundingCoords(source: Source): Point[] {
        const points: Point[] = []

        points.push({ x: source.pos.x - 1, y: source.pos.y })
        points.push({ x: source.pos.x + 1, y: source.pos.y })
        points.push({ x: source.pos.x, y: source.pos.y - 1 })
        points.push({ x: source.pos.x, y: source.pos.y + 1 })
        points.push({ x: source.pos.x - 1, y: source.pos.y - 1 })
        points.push({ x: source.pos.x + 1, y: source.pos.y - 1 })
        points.push({ x: source.pos.x - 1, y: source.pos.y + 1 })
        points.push({ x: source.pos.x + 1, y: source.pos.y + 1 })

        return points
    }

    private IsWalkableStruct(site: Structure | ConstructionSite): boolean {
        let is_walkable = false
        if (
            site.structureType === STRUCTURE_CONTAINER
            || site.structureType === STRUCTURE_ROAD
            || site.structureType === STRUCTURE_RAMPART
        ) {
            is_walkable = true
        }

        return is_walkable
    }

    GetSource(): Source | null {
        return Game.getObjectById<Source>(this.m_Id)
    }

    HasFreeSpot(): boolean {
        const source = this.GetSource()
        let has_free_spot = Boolean(source)

        if (source) {
            const points = this.GetSurroundingCoords(source)
            const room = source.room

            for (let point of points) {
                const spot = room.lookAt(point.x, point.y)
                
                if (spot.length > 1 || spot[0].terrain === "wall") {
                    has_free_spot = false
                }
                else {
                    has_free_spot = true
                    break
                }
            }
        }

        return has_free_spot
    }

    HarvestEnergy(creep: Creep): ScreepsReturnCode {
        const source = this.GetSource()
        let screep_return_code: ScreepsReturnCode = ERR_NOT_FOUND

        if (source) {
            screep_return_code = creep.harvest(source)
        }

        return screep_return_code
    }
}