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
        .filter(c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)

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

export function SortStructs(a: Structure<StructureConstant> | null, b: Structure<StructureConstant> | null) {
    const DECAYING_STRUCT_TYPES: StructureConstant[] = [
        STRUCTURE_CONTAINER,
        STRUCTURE_RAMPART,
        STRUCTURE_ROAD
    ]

    const GetStructValue = (struct: Structure<StructureConstant>) => {
        return struct.hits / struct.hitsMax
    }

    const GetCompareVal = (a: Structure<StructureConstant>, b: Structure<StructureConstant>) => {
        return GetStructValue(a) - GetStructValue(b)
    }

    if (a == null || b == null) { return 0 }

    const DECAYING_STRUCT_LOW_ON_HEALTH = (
        DECAYING_STRUCT_TYPES.includes(a.structureType)
        && !DECAYING_STRUCT_TYPES.includes(b.structureType)
        && GetStructValue(a) <= .15
    )

    const BOTH_STRUCTS_ARE_DECAYING = (
        DECAYING_STRUCT_TYPES.includes(a.structureType)
        && DECAYING_STRUCT_TYPES.includes(b.structureType)
    )

    if (DECAYING_STRUCT_LOW_ON_HEALTH) {
        return -1
    }
    else if (BOTH_STRUCTS_ARE_DECAYING) {
        if (a.structureType === STRUCTURE_RAMPART && GetStructValue(a) < .2) {
            return a.structureType === b.structureType ? GetCompareVal(a, b) : -1
        }
        else if (a.structureType === STRUCTURE_CONTAINER && GetStructValue(a) < .5) {
            return a.structureType === b.structureType ? GetCompareVal(a, b) : -1
        }

        return GetCompareVal(a, b)
    }

    return GetCompareVal(a, b)
}

