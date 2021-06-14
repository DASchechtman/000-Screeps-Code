export class ObjectsInRoom {
    private readonly MAP_TYPE = -1
    private readonly ARRAY_TYPE = -2

    public static readonly MY_CONSTRUCTION_SITES = 0
    public static readonly SOURCES = 1
    
    public static readonly MY_STRUCTS = 2
    public static readonly HOSTILE_STRUCTS = 3
    public static readonly UNOWNED_STRUCTS = 4 

    public static readonly MY_CREEPS = 5
    public static readonly HOSTILE_CREEPS = 6

    private m_Objects: Map<number, Map<string, Array<string>> | Array<string>>

    constructor() {
        this.m_Objects = new Map()
    }

    private AddKey(key: number, type: number): void {
        if(!this.m_Objects.has(key)) {
            if (type === this.MAP_TYPE) {
                this.m_Objects.set(key, new Map())
            }
            else if (type == this.ARRAY_TYPE) {
                this.m_Objects.set(key, new Array())
            }
        }
    }

    AddMap(key1: number, key2: string, val: string): void {
        this.AddKey(key1, this.MAP_TYPE)

        const map = this.m_Objects.get(key1)!! as Map<string, Array<string>>

        if(!map.has(key2)) {
            map.set(key2, new Array())
        }

        map.get(key2)?.push(val)
    }

    AddArray(key: number, val: string) {
        this.AddKey(key, this.ARRAY_TYPE)

        const array = this.m_Objects.get(key) as Array<string>

        array.push(val)
    }

    GetMap(key: number): Map<string, Array<string>> | undefined {
        let map: Map<string, Array<string>> | undefined = undefined

        if (this.m_Objects.get(key) instanceof Map) {
            map = this.m_Objects.get(key) as Map<string, Array<string>>
        }

        return map
    }

    GetArray(key: number): Array<string> | undefined {
        let array: Array<string> | undefined = undefined

        if (this.m_Objects.get(key) instanceof Array) {
            array = this.m_Objects.get(key) as Array<string>
        }

        return array
    }

    Has(key: number): boolean {
        return this.m_Objects.has(key)
    }

    Clear(): void {
        this.m_Objects.clear()
    }
}