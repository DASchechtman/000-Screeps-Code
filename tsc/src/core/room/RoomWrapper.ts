import { COLONY_ALLIES, COLONY_OWNER } from "../../consts/GameConstants";
import { ObjectsInRoom } from "./ObjectsInRoom";

export class RoomWrapper {
    private m_Name: string
    private m_Room_objects: ObjectsInRoom
    private m_Room: () => Room | undefined

    constructor(room_name: string) {
        this.m_Name = room_name;
        this.m_Room = this.GetRoom

        this.m_Room_objects = new ObjectsInRoom()
    }

    private GetRoom(): Room | undefined {
        return Game.rooms[this.m_Name]
    }

    private LoadStructs(key: number, type: StructureConstant, id: string): void {
        this.m_Room_objects.AddMap(key, type, id)
    }

    private LoadResources(key: number, id: string) {
        this.m_Room_objects.AddSet(key, id)
    }

    private LoadOwnedStructs(): void {
        const struct = this.m_Room()?.find(FIND_MY_STRUCTURES)

        if (struct) {
            for (let s of struct) {
                this.LoadStructs(ObjectsInRoom.MY_STRUCTS, s.structureType, s.id)
            }
        }
    }

    private LoadHostileStructs() {
        const structs = this.m_Room()?.find(FIND_HOSTILE_STRUCTURES)

        if (structs) {
            for (let hs of structs) {
                this.LoadStructs(ObjectsInRoom.HOSTILE_STRUCTS, hs.structureType, hs.id)
            }
        }
    }

    private LoadUnownedStructs() {
        const structs = this.m_Room()?.find(FIND_STRUCTURES)
        if (structs) {
            for (let uos of structs) {
                if (!uos) {
                    console.log("found null struct")
                } else {
                    if (!this.IsOwned(uos) && !this.IsHostile(uos)) {
                        this.LoadStructs(ObjectsInRoom.UNOWNED_STRUCTS, uos.structureType, uos.id)
                    }
                }
            }
        }
    }

    private LoadSources() {
        const sources = this.m_Room()?.find(FIND_SOURCES)
        if (sources) {
            for (let energy of sources) {
                this.LoadResources(ObjectsInRoom.SOURCES, energy.id)
            }
        }
    }

    private LoadConstructionSites() {
        const sites = this.m_Room()?.find(FIND_MY_CONSTRUCTION_SITES)
        if (sites) {
            for (let site of sites) {
                this.LoadResources(ObjectsInRoom.MY_CONSTRUCTION_SITES, site.id)
            }
        }
    }

    private LoadMyCreeps() {
        const creeps = this.m_Room()?.find(FIND_MY_CREEPS)
        if (creeps) {
            for (let creep of creeps) {
                this.LoadResources(ObjectsInRoom.MY_CREEPS, creep.id)
            }
        }
    }

    private LoadHostileCreeps() {
        const hostile_creeps = this.m_Room()?.find(FIND_HOSTILE_CREEPS)
        if (hostile_creeps) {
            for (let creep of hostile_creeps) {
                this.LoadResources(ObjectsInRoom.HOSTILE_CREEPS, creep.id)
            }
        }
    }

    private GetOwnerName(struct: Structure): string | undefined {
        return (struct as OwnedStructure).owner?.username
    }

    private IsOwned(struct: Structure): boolean {
        const struct_owner = this.GetOwnerName(struct)
        const string_type = typeof struct_owner === 'string'
        return Boolean(string_type && struct_owner === COLONY_OWNER)
    }

    private IsHostile(struct: Structure): boolean {
        const struct_owner = this.GetOwnerName(struct)
        const string_type = typeof struct_owner === 'string'
        return Boolean(string_type && struct_owner !== COLONY_OWNER)
    }

    private GetStructures<T>(struct_type: string, map: Map<string, Set<string>> | undefined): T[] {
        const found_structs = new Array<T>()

        if (map) {
            const list = map.get(struct_type)

            if (list) {
                for (var id of list) {
                    const struct_id = id as Id<T>

                    const struct = Game.getObjectById(struct_id)

                    if (struct) {
                        found_structs.push(struct)
                    }

                }
            }
        }

        return found_structs
    }

    private GetResource<T>(key: number): Array<T> {
        const resource_objects = new Array<T>()
        const resource_array = this.m_Room_objects.GetSet(key)

        if (resource_array) {
            for (var id of resource_array) {
                const resource_id = id as Id<T>
                const resource = Game.getObjectById(resource_id)

                if (resource) {
                    resource_objects.push(resource)
                }
            }
        }

        return resource_objects;
    }

    GetOwnedStructures<T>(struct_type: string): T[] {
        const key = ObjectsInRoom.MY_STRUCTS
        this.LoadOwnedStructs()
        const map = this.m_Room_objects.GetMap(key)
        return this.GetStructures<T>(struct_type, map)
    }

    GetHostileStructures<T>(struct_type: string): T[] {
        const key = ObjectsInRoom.HOSTILE_STRUCTS
        this.LoadHostileStructs()
        const map = this.m_Room_objects.GetMap(key)
        return this.GetStructures<T>(struct_type, map)
    }

    GetUnownedStructures<T>(struct_type: string): T[] {
        const key = ObjectsInRoom.UNOWNED_STRUCTS
        this.LoadUnownedStructs()
        const map = this.m_Room_objects.GetMap(key)
        return this.GetStructures<T>(struct_type, map)
    }

    GetAllNonHostileStructs(filter?: (struct: Structure<any>) => boolean) {
        const struct_type_keys = [
            ObjectsInRoom.MY_STRUCTS,
            ObjectsInRoom.UNOWNED_STRUCTS
        ]

        const structs = new Array<Structure<any>>()
        this.LoadOwnedStructs()
        this.LoadUnownedStructs()

        for (let key of struct_type_keys) {
            this.m_Room_objects.GetMap(key)?.forEach((value, key) => {
                for (let id of value) {
                    const struct_id = id as Id<any>
                    const room_struct = Game.getObjectById(struct_id)

                    const is_filter = room_struct && filter && filter(room_struct)
                    const isnt_filter = room_struct && filter === undefined

                    if (is_filter || isnt_filter) {
                        structs.push(room_struct)
                    }
                }
            })
        }

        return structs
    }

    GetConstructionSites(): ConstructionSite[] {
        const key = ObjectsInRoom.MY_CONSTRUCTION_SITES
        this.LoadConstructionSites()
        return this.GetResource<ConstructionSite>(key)
    }

    GetController(): StructureController | null {
        const controller_list = this.GetOwnedStructures<StructureController>(STRUCTURE_CONTROLLER)
        let controller: StructureController | null = null

        if (controller_list.length > 0) {
            controller = controller_list[0]
        }

        return controller
    }

    GetSources(): Source[] {
        const key = ObjectsInRoom.SOURCES
        this.LoadSources()
        return this.GetResource<Source>(key)
    }

    GetMyCreeps(): Creep[] {
        const key = ObjectsInRoom.MY_CREEPS
        this.LoadMyCreeps()
        let arr = this.GetResource<Creep>(key)
        return arr
    }

    GetHostileCreeps(): Creep[] {
        const key = ObjectsInRoom.HOSTILE_CREEPS

        this.LoadHostileCreeps()

        const whitelist = COLONY_ALLIES
        const foreign_creeps = this.GetResource<Creep>(key)
        const hostile_creep = new Array<Creep>()

        for (let creep of foreign_creeps) {
            let is_enemy = true
            for (let ally of whitelist) {
                if (creep.owner.username === ally) {
                    is_enemy = false
                    break
                }
            }

            if (is_enemy) {
                hostile_creep.push(creep)
            }
        }

        return hostile_creep
    }

    GetEnergyCapacity(): number {
        const room = Game.rooms[this.m_Name]
        let total_energy = -1

        if (room) {
            total_energy = room.energyCapacityAvailable
        }

        return total_energy
    }

    GetEnergyStored(): number {
        const room = Game.rooms[this.m_Name]
        let stored_energy = -1

        if (room) {
            stored_energy = room.energyAvailable
        }

        return stored_energy
    }

    GetName(): string {
        return this.m_Name
    }

}