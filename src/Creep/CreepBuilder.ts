export class CreepBuilder {
    public static readonly WORKER_BODY = [WORK, MOVE, CARRY, ATTACK]
    public static readonly DEFENDER_BODY = [ATTACK, ATTACK, MOVE, MOVE, TOUGH, TOUGH, TOUGH, TOUGH]

    private static GetEnergyConst(part: BodyPartConstant) {
        let cost = 0

        switch(part) {
            case MOVE: {
                cost = 50
                break
            }
            case WORK: {
                cost = 100
                break
            }
            case CARRY: {
                cost = 50
                break
            }
            case ATTACK: {
                cost = 80
                break
            }
            case RANGED_ATTACK: {
                cost = 150
                break
            }
            case HEAL: {
                cost = 250
                break
            }
            case CLAIM: {
                cost = 600
                break
            }
            case TOUGH: {
                cost = 10
                break
            }
        }

        return cost
    }

    static BuildBody(enegy_cost_cap: number, body_parts: Array<BodyPartConstant>): BodyPartConstant[] {
        let total = 0
        let building = true
        const body = new Array<BodyPartConstant>()

        while(building) {
            for(let part of body_parts) {
                const part_cost =  this.GetEnergyConst(part)

                if (part_cost + total >= enegy_cost_cap) {
                    building = false
                    break
                }

                total += part_cost
                body.push(part)
            }
        }

        return body
    }

    static GetBodyCost(body: Array<BodyPartConstant>): number {
        let total = 0

        for (let part of body) {
            total += this.GetEnergyConst(part)
        }

        return total
    }
}