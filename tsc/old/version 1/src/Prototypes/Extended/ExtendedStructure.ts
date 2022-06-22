export class ExtendedStructure extends Structure {

    Get<T extends StructureConstant>(id: Id<Structure<T>>): Structure<T> | null {
        return Game.getObjectById(id)
    }

    CurHealth(): number {
        return this.GetHealthValue(this.hits)
    }

    MaxHealth(): number {
        return this.GetHealthValue(this.hitsMax)
    }

    RunBehavior(...args: unknown[]): number { return 0 }

    private GetHealthValue(health_val: number): number {
        let val = Number.MAX_SAFE_INTEGER
        if (typeof health_val === 'number' && health_val > 0) {
            val = health_val
        }
        return val
    }
}