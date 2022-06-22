"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildScalableDefender = exports.BuildScalableWorker = exports.GetBodyCost = exports.BuildBody = exports.BuildScalable = exports.GetEnergyConst = exports.DEFENDER_BODY = exports.WORKER_BODY = void 0;
exports.WORKER_BODY = [WORK, MOVE, CARRY, MOVE];
exports.DEFENDER_BODY = [ATTACK, ATTACK, MOVE, MOVE, TOUGH, TOUGH, TOUGH, TOUGH];
function GetEnergyConst(part) {
    return BODYPART_COST[part];
}
exports.GetEnergyConst = GetEnergyConst;
function BuildScalable(energy_cost, body, build_cost = 1200) {
    if (energy_cost < build_cost) {
        build_cost = energy_cost;
    }
    return BuildBody(build_cost, body);
}
exports.BuildScalable = BuildScalable;
function BuildBody(enegy_cost_cap, body_parts) {
    let total = 0;
    let building = true;
    const body = [];
    while (building) {
        for (let part of body_parts) {
            const part_cost = GetEnergyConst(part);
            if (part_cost + total > enegy_cost_cap) {
                building = false;
                break;
            }
            total += part_cost;
            body.push(part);
        }
    }
    return body;
}
exports.BuildBody = BuildBody;
function GetBodyCost(body) {
    let total = 0;
    for (let part of body) {
        total += GetEnergyConst(part);
    }
    return total;
}
exports.GetBodyCost = GetBodyCost;
function BuildScalableWorker(avalible_energy) {
    return BuildScalable(avalible_energy, exports.WORKER_BODY);
}
exports.BuildScalableWorker = BuildScalableWorker;
function BuildScalableDefender(avalible_energy) {
    return BuildScalable(avalible_energy, exports.DEFENDER_BODY, 1800);
}
exports.BuildScalableDefender = BuildScalableDefender;
