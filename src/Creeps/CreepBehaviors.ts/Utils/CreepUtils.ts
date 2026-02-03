import { RoomData } from "Rooms/RoomData";

export function GetContainerIdIfThereIsEnoughStoredEnergy(creep: Creep) {
    const CONTAINERS = RoomData.GetRoomData().GetRoomStructures(STRUCTURE_CONTAINER)
        .map(id => Game.getObjectById(id))
        .filter((s) => {
            const HAS_ENOUGH_ENERGY = (
                (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY)
                > creep.store.getCapacity()
            )
            return s != null && HAS_ENOUGH_ENERGY
        })
        .sort((a, b) => {
            const CONTAINER_1 = a as StructureContainer
            const CONTAINER_2 = b as StructureContainer

            return CONTAINER_1.store.getUsedCapacity(RESOURCE_ENERGY) - CONTAINER_2.store.getUsedCapacity(RESOURCE_ENERGY)
        }) as StructureContainer[]

        if (CONTAINERS.length > 0) {
            return CONTAINERS.at(-1)!.id
        }

    return 'N/A'
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

export function GetEnergy(creep: Creep, source1: Source, source2: Source | undefined | null, container: StructureContainer | null) {
    if (container && creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { maxRooms: 1 })
    }
    else {
        let ret = creep.harvest(source1)
        if (ret === ERR_NOT_ENOUGH_ENERGY && source2) {
            ret = creep.harvest(source2)
            if (ret === ERR_NOT_IN_RANGE) {
                creep.moveTo(source2, { maxRooms: 1 })
            }
        }
        else if (ret === ERR_NOT_IN_RANGE) {
            creep.moveTo(source1, { maxRooms: 1 })
        }
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
        && GetStructValue(a) <= .15
    )

    const BOTH_STRUCTS_ARE_DECAYING = (
        DECAYING_STRUCT_TYPES.includes(a.structureType)
        && DECAYING_STRUCT_TYPES.includes(b.structureType)
    )

    if (a.structureType === STRUCTURE_RAMPART && a.hits < 15000) {
        return -1
    }
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

export function GetDamagedStruct(): Structure | null {
    let struct: Structure | null = null
    const DECAYING_STRUCT_TYPES: StructureConstant[] = [
        STRUCTURE_ROAD,
        STRUCTURE_RAMPART,
        STRUCTURE_CONTAINER
    ]
    const OWNED_STRUCTURES = RoomData.GetRoomData().GetOwnedStructureIds()
        .map(id => Game.getObjectById(id))
        .filter(s => s != null && s.hits / s.hitsMax < .75) as Structure[]

    const ROOM_STRUCTURES = RoomData.GetRoomData().GetRoomStructures([
        STRUCTURE_WALL,
        STRUCTURE_CONTAINER
    ])
        .map(id => Game.getObjectById(id as Id<Structure>))
        .filter(s => {
            if (s == null) { return false }

            let health_limit = 0
            if (s.structureType === STRUCTURE_RAMPART) {
                health_limit = .35
            }
            else if (s.structureType === STRUCTURE_ROAD) {
                health_limit = .25
            }
            else {
                health_limit = .2
            }

            return s.hits / s.hitsMax < health_limit
        }) as Structure[]

    const DECAYING_STRUCTURES = [
        ...OWNED_STRUCTURES,
        ...ROOM_STRUCTURES
    ]
        .filter(s => DECAYING_STRUCT_TYPES.includes(s.structureType) && s.hits / s.hitsMax <= .20)

    if (DECAYING_STRUCTURES.length > 0) {
        const SORTED = DECAYING_STRUCTURES
        .sort((a, b) => {
            return (a.hits / a.hitsMax) - (b.hits / b.hitsMax)
        })

        struct = SORTED[0]
    }
    else if (OWNED_STRUCTURES.length > 0 || ROOM_STRUCTURES.length > 0){
        const SORTED = [
            ...OWNED_STRUCTURES,
            ...ROOM_STRUCTURES
        ].sort((a, b) => {
            return (a.hits / a.hitsMax) - (b.hits / b.hitsMax)
        })

        struct = SORTED[0]
    }

    return struct
}

