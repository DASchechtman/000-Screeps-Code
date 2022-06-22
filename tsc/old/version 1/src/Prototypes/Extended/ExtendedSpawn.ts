export class ExtendedSpawn extends StructureSpawn {
    private extended_id: number = 100
    constructor(id: Id<StructureSpawn>) {
        super(id)
        this.extended_id++
    }

    RunBehavior(...args: unknown[]): number { 
        console.log(`spawn behavior: ${this.extended_id}`)
        return 1
    }


}