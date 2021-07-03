import { Owner } from "../Constants/GameObjectConsts";
import { ObjectsInRoom } from "./ObjectsInRoom";

export class RoomWrapper {
    private m_Name: string
    private m_Room_objects: ObjectsInRoom
    private m_Avalible_energy: number | null = null

    constructor(room_name: string) {
        this.m_Name = room_name;

        this.m_Room_objects = new ObjectsInRoom()

        this.LoadRoomResources()
    }

    private LoadRoomResources(): void {

        const room = Game.rooms[this.m_Name];

        if (room) {
            const found_structs = room.find(FIND_STRUCTURES)
            const sources = room.find(FIND_SOURCES)
            const construction_sites = room.find(FIND_MY_CONSTRUCTION_SITES)
            const my_creeps = room.find(FIND_MY_CREEPS)
            const hostile_creeps = room.find(FIND_HOSTILE_CREEPS)
            this.m_Avalible_energy = room.energyCapacityAvailable

            for (var struct of found_structs) {
                struct.id
                const type = struct.structureType

                if (this.IsOwned(struct)) {
                    const key = ObjectsInRoom.MY_STRUCTS
                    this.m_Room_objects.AddMap(key, type, struct.id)
                }
                else if (this.IsHostile(struct)) {
                    const key = ObjectsInRoom.HOSTILE_STRUCTS
                    this.m_Room_objects.AddMap(key, type, struct.id)
                }
                else {
                    const key = ObjectsInRoom.UNOWNED_STRUCTS
                    this.m_Room_objects.AddMap(key, type, struct.id)
                }
            }

            for (var energy of sources) {
                const key = ObjectsInRoom.SOURCES
                this.m_Room_objects.AddArray(key, energy.id)
            }

            for (var site of construction_sites) {
                const key = ObjectsInRoom.MY_CONSTRUCTION_SITES
                this.m_Room_objects.AddArray(key, site.id)
            }

            for (var creep of my_creeps) {
                const key = ObjectsInRoom.MY_CREEPS
                this.m_Room_objects.AddArray(key, creep.id)
            }

            for (var hostile_creep of hostile_creeps) {
                const key = ObjectsInRoom.HOSTILE_CREEPS
                this.m_Room_objects.AddArray(key, hostile_creep.id)
            }
        }
    }

    private IsOwned(struct: Structure): boolean {
        let is_owned = false;

        if (
            struct instanceof OwnedStructure
            && Owner === struct.owner!!.username
        ) {
            is_owned = true;

        }
        return is_owned;
    }

    private IsHostile(struct: Structure): boolean {
        let is_hostile = false;

        if (
            struct instanceof OwnedStructure
            && Owner !== struct.owner!!.username
        ) {

        }

        return is_hostile

    }

    private GetStructures<T>(struct_type: string, map: Map<string, Array<string>> | undefined): T[] {
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
        const resource_array = this.m_Room_objects.GetArray(key)

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
        const map = this.m_Room_objects.GetMap(key)
        return this.GetStructures<T>(struct_type, map)
    }

    GetHostileStructures<T>(struct_type: string): T[] {
        const key = ObjectsInRoom.HOSTILE_STRUCTS
        const map = this.m_Room_objects.GetMap(key)
        return this.GetStructures<T>(struct_type, map)
    }

    GetUnownedStructures<T>(struct_type: string): T[] {
        const key = ObjectsInRoom.UNOWNED_STRUCTS
        const map = this.m_Room_objects.GetMap(key)
        return this.GetStructures<T>(struct_type, map)
    }

    GetConstructionSites(): ConstructionSite[] {
        return this.GetResource<ConstructionSite>(ObjectsInRoom.MY_CONSTRUCTION_SITES)
    }

    GetSources(): Source[] {
        return this.GetResource<Source>(ObjectsInRoom.SOURCES)
    }

    GetMyCreeps(): Creep[] {
        return this.GetResource<Creep>(ObjectsInRoom.MY_CREEPS)
    }

    GetHostileCreeps(): Creep[] {
        return this.GetResource<Creep>(ObjectsInRoom.HOSTILE_CREEPS)
    }

    GetEnergyCapacity(): number {
        let total_energy = -1

        if (this.m_Avalible_energy !== null) {
            total_energy = this.m_Avalible_energy
        }

        return total_energy
    }

    GetName(): string {
        return this.m_Name
    }

}