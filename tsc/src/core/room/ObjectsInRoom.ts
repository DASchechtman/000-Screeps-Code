export class ObjectsInRoom {
    private readonly MAP_TYPE = -1
    private readonly SET_TYPE = -2

    public static readonly MY_CONSTRUCTION_SITES = 0
    public static readonly SOURCES = 1
    
    public static readonly MY_STRUCTS = 2
    public static readonly HOSTILE_STRUCTS = 3
    public static readonly UNOWNED_STRUCTS = 4 

    public static readonly MY_CREEPS = 5
    public static readonly HOSTILE_CREEPS = 6

    private m_Objects: Map<number, Map<string, Set<string>> | Set<string>>

    constructor() {
        this.m_Objects = new Map()
    }

    private AddKey(key: number, type: number): void {
        if(!this.m_Objects.has(key)) {
            if (type === this.MAP_TYPE) {
                this.m_Objects.set(key, new Map())
            }
            else if (type == this.SET_TYPE) {
                this.m_Objects.set(key, new Set())
            }
        }
    }

    AddMap(key1: number, key2: string, val: string): void {
        this.AddKey(key1, this.MAP_TYPE)

        const map = this.m_Objects.get(key1)!! as Map<string, Set<string>>

        if(!map.has(key2)) {
            map.set(key2, new Set())
        }

        map.get(key2)?.add(val)
    }

    AddSet(key: number, val: string) {
        this.AddKey(key, this.SET_TYPE)
        const set = this.m_Objects.get(key) as Set<string>
        set.add(val)
    }

    GetMap(key: number): Map<string, Set<string>> | undefined {
        let map: Map<string, Set<string>> | undefined = undefined

        if (this.m_Objects.get(key) instanceof Map) {
            map = this.m_Objects.get(key) as Map<string, Set<string>>
        }

        return map
    }

    GetSet(key: number): Set<string> | undefined {
        let set: Set<string> | undefined = undefined

        if (this.m_Objects.get(key) instanceof Set) {
            set = this.m_Objects.get(key) as Set<string>
        }

        return set
    }

    Has(key: number): boolean {
        return this.m_Objects.has(key)
    }

    Clear(): void {
        this.m_Objects.clear()
    }
}