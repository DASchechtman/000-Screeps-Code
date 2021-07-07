"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepBuilder = void 0;
var CreepBuilder = /** @class */ (function () {
    function CreepBuilder() {
    }
    CreepBuilder.GetEnergyConst = function (part) {
        var cost = 0;
        switch (part) {
            case MOVE: {
                cost = 50;
                break;
            }
            case WORK: {
                cost = 100;
                break;
            }
            case CARRY: {
                cost = 50;
                break;
            }
            case ATTACK: {
                cost = 80;
                break;
            }
            case RANGED_ATTACK: {
                cost = 150;
                break;
            }
            case HEAL: {
                cost = 250;
                break;
            }
            case CLAIM: {
                cost = 600;
                break;
            }
            case TOUGH: {
                cost = 10;
                break;
            }
        }
        return cost;
    };
    CreepBuilder.BuildScalable = function (energy_cost, body, build_cost) {
        if (build_cost === void 0) { build_cost = 1200; }
        if (energy_cost < build_cost) {
            build_cost = energy_cost;
        }
        return this.BuildBody(build_cost, body);
    };
    CreepBuilder.BuildBody = function (enegy_cost_cap, body_parts) {
        var total = 0;
        var building = true;
        var body = new Array();
        while (building) {
            for (var _i = 0, body_parts_1 = body_parts; _i < body_parts_1.length; _i++) {
                var part = body_parts_1[_i];
                var part_cost = this.GetEnergyConst(part);
                if (part_cost + total >= enegy_cost_cap) {
                    building = false;
                    break;
                }
                total += part_cost;
                body.push(part);
            }
        }
        return body;
    };
    CreepBuilder.GetBodyCost = function (body) {
        var total = 0;
        for (var _i = 0, body_1 = body; _i < body_1.length; _i++) {
            var part = body_1[_i];
            total += this.GetEnergyConst(part);
        }
        return total;
    };
    CreepBuilder.BuildScalableWorker = function (avalible_energy) {
        return this.BuildScalable(avalible_energy, CreepBuilder.WORKER_BODY);
    };
    CreepBuilder.BuildScalableDefender = function (avalible_energy) {
        return this.BuildScalable(avalible_energy, CreepBuilder.DEFENDER_BODY, 1800);
    };
    CreepBuilder.WORKER_BODY = [WORK, MOVE, CARRY, MOVE];
    CreepBuilder.DEFENDER_BODY = [ATTACK, ATTACK, MOVE, MOVE, TOUGH, TOUGH, TOUGH, TOUGH];
    return CreepBuilder;
}());
exports.CreepBuilder = CreepBuilder;
