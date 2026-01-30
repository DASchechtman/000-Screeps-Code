import { RoomData } from "Rooms/RoomData";

export function GetContainerIdIfThereIsEnoughStoredEnergy(container_id: string) {
    const CONTAINERS = RoomData.GetRoomData().GetRoomStructures(STRUCTURE_CONTAINER)
        .map(id => Game.getObjectById(id))
        .filter(s => s !== null) as StructureContainer[]

    const ENERGY_PER_CONTAINER = 2000

    const STORED_ENERGY = CONTAINERS.reduce((prev, cur) => {
        return prev + cur.store.getUsedCapacity(RESOURCE_ENERGY)
    }, 0)

    const HAS_ENOUGH_ENERGY = STORED_ENERGY > 0 && STORED_ENERGY >= ENERGY_PER_CONTAINER * CONTAINERS.length * .9
    const HAS_TOO_LITTLE_ENERGY = STORED_ENERGY <= ENERGY_PER_CONTAINER * CONTAINERS.length * .1
    if (HAS_ENOUGH_ENERGY) {
        const SORTED_CONTAINERS = CONTAINERS.sort((a, b) => {
            return a.store.getUsedCapacity(RESOURCE_ENERGY) - b.store.getUsedCapacity(RESOURCE_ENERGY)
        })

        return SORTED_CONTAINERS.at(-1)!.id
    }
    else if (HAS_TOO_LITTLE_ENERGY) {
        return 'N/A'
    }

    return container_id
}

export function FlipStateBasedOnEnergyInCreep(creep: Creep, state: boolean) {
    const ENERGY_FULL = creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
    const ENERGY_EMPTY = creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0

    if (ENERGY_FULL) {
        return true
    }
    else if (ENERGY_EMPTY) {
        return false
    }

    return state
}

export function GetEnergy(creep: Creep, source: Source, container: StructureContainer | null) {
    if (container && creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { maxRooms: 1 })
    }
    else if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { maxRooms: 1 })
    }
}
