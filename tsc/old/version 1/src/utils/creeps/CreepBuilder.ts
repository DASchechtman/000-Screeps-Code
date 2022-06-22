export const WORKER_BODY = [WORK, MOVE, CARRY, MOVE]
export const DEFENDER_BODY = [ATTACK, ATTACK, MOVE, MOVE, TOUGH, TOUGH, TOUGH, TOUGH]

export function GetEnergyConst(part: BodyPartConstant): number {
    return BODYPART_COST[part]
}

export function BuildScalable(energy_cost: number, body: BodyPartConstant[], build_cost: number = 1200) {
    if (energy_cost < build_cost) {
        build_cost = energy_cost
    }

    return BuildBody(build_cost, body)
}

export function BuildBody(enegy_cost_cap: number, body_parts: BodyPartConstant[]): BodyPartConstant[] {
    let total = 0
    let building = true
    const body: BodyPartConstant[] = []

    while (building) {
        for (let part of body_parts) {
            const part_cost = GetEnergyConst(part)

            if (part_cost + total > enegy_cost_cap) {
                building = false
                break
            }

            total += part_cost
            body.push(part)
        }
    }

    return body
}

export function GetBodyCost(body: BodyPartConstant[]): number {
    let total = 0

    for (let part of body) {
        total += GetEnergyConst(part)
    }

    return total
}

export function BuildScalableWorker(avalible_energy: number) {
    return BuildScalable(avalible_energy, WORKER_BODY)
}

export function BuildScalableDefender(avalible_energy: number) {
    return BuildScalable(avalible_energy, DEFENDER_BODY, 1800)
}

