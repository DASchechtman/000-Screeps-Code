"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceWrapper = void 0;
class SourceWrapper {
    constructor(id) {
        this.m_Source = undefined;
        this.m_Id = id;
    }
    GetSurroundingCoords(source) {
        const points = [];
        points.push({ x: source.pos.x - 1, y: source.pos.y });
        points.push({ x: source.pos.x + 1, y: source.pos.y });
        points.push({ x: source.pos.x, y: source.pos.y - 1 });
        points.push({ x: source.pos.x, y: source.pos.y + 1 });
        points.push({ x: source.pos.x - 1, y: source.pos.y - 1 });
        points.push({ x: source.pos.x + 1, y: source.pos.y - 1 });
        points.push({ x: source.pos.x - 1, y: source.pos.y + 1 });
        points.push({ x: source.pos.x + 1, y: source.pos.y + 1 });
        return points;
    }
    IsWalkableStruct(site) {
        let is_walkable = false;
        if (site &&
            (site.structureType === STRUCTURE_CONTAINER
                || site.structureType === STRUCTURE_ROAD
                || site.structureType === STRUCTURE_RAMPART)) {
            is_walkable = true;
        }
        else if (site === undefined) {
            is_walkable = true;
        }
        return is_walkable;
    }
    GetSource() {
        return Game.getObjectById(this.m_Id);
    }
    HasFreeSpot() {
        const source = this.GetSource();
        let has_free_spot = Boolean(source);
        if (source) {
            const points = this.GetSurroundingCoords(source);
            const room = source.room;
            for (let point of points) {
                const spot = room.lookAt(point.x, point.y);
                const terrain_index = spot.length - 1;
                const obj_index = 0;
                const Walkable = this.IsWalkableStruct;
                if (spot[terrain_index].terrain === "wall") {
                    has_free_spot = false;
                }
                else if (!Walkable(spot[obj_index].constructionSite) || !Walkable(spot[obj_index].structure)) {
                    has_free_spot = false;
                }
                else if (spot[obj_index].creep || spot[obj_index].powerCreep) {
                    has_free_spot = false;
                }
                else {
                    has_free_spot = true;
                    break;
                }
            }
        }
        return has_free_spot;
    }
    HarvestEnergy(creep) {
        const source = this.GetSource();
        let screep_return_code = ERR_NOT_FOUND;
        if (source) {
            screep_return_code = creep.harvest(source);
        }
        return screep_return_code;
    }
}
exports.SourceWrapper = SourceWrapper;
