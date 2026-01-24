import { CreepBehavior } from "Creeps/Creep";
import { ScreepFile } from "FileSystem/File";

export class BuildBehavior implements CreepBehavior {

    public constructor(id: string) {

    }

    public Load(file: ScreepFile) {
        return true
    }

    public Run() {

    }

    public Cleanup(file: ScreepFile) {

    }
}
