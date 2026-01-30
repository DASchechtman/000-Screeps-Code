import { ScreepFile } from "FileSystem/File";
import { EntityBehavior } from "./BehaviorTypes";
import { JsonObj } from "Consts";
import { SafeReadFromFileWithOverwrite } from "utils/UtilFuncs";
import { TowerBehavior } from "./TowerBehavior";
import { FlipStateBasedOnEnergyInCreep, GetContainerIdIfThereIsEnoughStoredEnergy, GetEnergy } from "./Utils/CreepUtils";
import { Timer } from "utils/Timer";

export class TowerSupplierBehavior implements EntityBehavior {
    private creep: Creep | null
    private source: Source | null
    private tower_id_key: string
    private state_key: string
    private energy_source_key: string
    private data: JsonObj

    constructor() {
        this.creep = null
        this.source = null
        this.tower_id_key = "tower to supply"
        this.state_key = "state"
        this.energy_source_key = "from container"
        this.data = {}
    }

    Load(file: ScreepFile, id: string) {
        this.creep = Game.getObjectById(id as Id<Creep>)
        this.data[this.state_key] = SafeReadFromFileWithOverwrite(file, this.state_key, false)
        this.data[this.tower_id_key] = SafeReadFromFileWithOverwrite(file, this.tower_id_key, 'null')
        this.data[this.energy_source_key] = SafeReadFromFileWithOverwrite(file, this.energy_source_key, 'null')

        if (this.creep && !this.source) {
            this.source = this.creep.room.find(FIND_SOURCES)[1]
        }

        if (this.data[this.tower_id_key] === 'null') {
            const TOWER_ID = TowerBehavior.GetTowerId()
            if (TOWER_ID != null) {
                 this.data[this.tower_id_key] = TOWER_ID
            }
        }

        const TIMER = new Timer(id)
        TIMER.StartTimer(15)

        if (this.data[this.energy_source_key] === 'null' || TIMER.IsTimerDone()) {
            this.data[this.energy_source_key] = GetContainerIdIfThereIsEnoughStoredEnergy(this.data[this.energy_source_key] as string)
            if (this.data[this.energy_source_key] === 'null') {
                this.data[this.energy_source_key] = 'N/A'
            }
        }

        return this.creep != null
    }

    Run() {
        if (this.creep == null) { return }
        this.data[this.state_key] = FlipStateBasedOnEnergyInCreep(this.creep, this.data[this.state_key] as boolean)

        if (!this.data[this.state_key]) {
            if (this.source == null) { return }
            let container = Game.getObjectById(this.data[this.energy_source_key] as Id<StructureContainer>)
            if (container && container.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                const container_id = GetContainerIdIfThereIsEnoughStoredEnergy(this.data[this.energy_source_key] as string)
                container = Game.getObjectById(container_id as Id<StructureContainer>)
            }
            GetEnergy(this.creep, this.source, container)
        }
        else {
            const TOWER = Game.getObjectById(this.data[this.tower_id_key] as Id<StructureTower>)
            if (TOWER == null) { return }

            if (this.creep.transfer(TOWER, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(TOWER)
            }
        }
    }

    Cleanup(file: ScreepFile) {
        file.WriteAllToFile([
            {key: this.state_key, value: this.data[this.state_key]},
            {key: this.tower_id_key, value: this.data[this.tower_id_key]},
            {key: this.energy_source_key, value: this.data[this.energy_source_key]}
        ])
    }

    Unload(file: ScreepFile) {}

}
