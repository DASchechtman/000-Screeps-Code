export class ExtendedCreep extends Creep {
    Get(id: Id<Creep>): Creep | null {
        return Game.getObjectById(id)
    }
}