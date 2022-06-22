export class ExtendedSpawn extends StructureSpawn {
    private extended_id: number = 100
    constructor(id: Id<StructureSpawn>) {
        super(id)
        this.extended_id++
    }

    RunBehavior(...args: unknown[]): number { 
        return 1
    }


}