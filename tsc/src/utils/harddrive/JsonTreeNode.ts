export enum NodeTypes {JSON_MAP, JSON_ARRAY, JSON_NUM, JSON_STR, JSON_BOOL, JSON_NULL, JSON_EMPTY}

export type JsonArray = Array<JsonTreeNode>
export type JsonMap = Map<string, JsonTreeNode>
export type JsonType = number | boolean | string | null | JsonArray | JsonMap

export class JsonTreeNode {
    private m_data: JsonType | undefined
    private m_time_since_last_access: number
    private m_type: NodeTypes

    constructor(data: JsonType | undefined = undefined) {
        this.m_time_since_last_access = Game.time
        this.m_type = NodeTypes.JSON_EMPTY
        this.m_data = data
        if (data !== undefined) {
            this.m_type = this.GetTypeOfData(data)
        }
    }

    private GetTypeOfData(data: JsonType): NodeTypes {
        let type: NodeTypes

        if (typeof data === 'number') {
            type = NodeTypes.JSON_NUM
        }
        else if (typeof data === 'string') {
            type = NodeTypes.JSON_STR
        }
        else if (typeof data === 'boolean') {
            type = NodeTypes.JSON_BOOL
        }
        else if (data === null) {
            type = NodeTypes.JSON_NULL
        }
        else if (data instanceof Array) {
            type = NodeTypes.JSON_ARRAY
        }
        else {
            type = NodeTypes.JSON_MAP
        }

        return type!
    }

    private WithinBoundsOfJsonArray(index: number): boolean {
        return this.m_type === NodeTypes.JSON_ARRAY && index >= 0 && index < (this.m_data as JsonArray).length
    }

    private UpdateLastAccessTime(): void {
        this.m_time_since_last_access = Game.time
    }

    public LastAccessedAt(): number {
        return this.m_time_since_last_access
    }

    public Type(): NodeTypes {
        this.UpdateLastAccessTime()
        return this.m_type
    }

    public SetData(data: JsonType): void {
        this.UpdateLastAccessTime()
        const type = this.GetTypeOfData(data)
        if (this.m_type === type) {
            this.m_data = data
        }
    }

    public GetData(): JsonType | undefined {
        this.UpdateLastAccessTime()
        return this.m_data
    }

    public GetFromArray(index: number): JsonTreeNode {
        this.UpdateLastAccessTime()
        if (this.WithinBoundsOfJsonArray(index)) {
            return (this.m_data as JsonArray)[index]
        }
        return new JsonTreeNode()
    }

    public PutInArray(index: number, data: JsonType): void {
        this.UpdateLastAccessTime()
        if (this.WithinBoundsOfJsonArray(index)) {
            (this.m_data as JsonArray)[index] = new JsonTreeNode(data)
        }
    }

    public PushBackData(data: JsonType) {
        this.UpdateLastAccessTime()
        if(this.m_type === NodeTypes.JSON_ARRAY) {
            (this.m_data as JsonArray).push(new JsonTreeNode(data))
        }
    }

    public PushBackNode(data: JsonTreeNode) {
        this.UpdateLastAccessTime()
        if (this.m_type === NodeTypes.JSON_ARRAY) {
            (this.m_data as JsonArray).push(data)
        }
    }

    public SizeOfArray(): number {
        this.UpdateLastAccessTime()
        return this.m_type === NodeTypes.JSON_ARRAY ? (this.m_data as JsonArray).length : -1
    }

    public FilterArray(callback: (item: JsonTreeNode) => boolean): void {
        this.UpdateLastAccessTime()
        if (this.m_type === NodeTypes.JSON_ARRAY) {
            this.m_data = (this.m_data as JsonArray).filter(callback)
        }
    }

    public GetChild(name: string): JsonTreeNode {
        this.UpdateLastAccessTime()
        if (this.m_type === NodeTypes.JSON_MAP && (this.m_data as JsonMap).has(name)) {
            return (this.m_data as JsonMap).get(name)!
        }
        return new JsonTreeNode()
    }

    public CreateChild(name: string, data: JsonType): JsonTreeNode {
        this.UpdateLastAccessTime()
        if (this.m_type === NodeTypes.JSON_MAP) {
            const new_child = new JsonTreeNode(data);
            (this.m_data as JsonMap).set(name, new_child)
            return new_child
        }
        return new JsonTreeNode()
    }

    public AddChild(name: string, data: JsonTreeNode) {
        this.UpdateLastAccessTime()
        if (this.m_type === NodeTypes.JSON_MAP) {
            (this.m_data as JsonMap).set(name, data)
        }
    }

    public RemoveChild(name: string) {
        this.UpdateLastAccessTime()
        if (this.m_type === NodeTypes.JSON_MAP) {
            (this.m_data as JsonMap).delete(name)
        }
    }

    public SizeOfMap(): number {
        this.UpdateLastAccessTime()
        return this.m_type === NodeTypes.JSON_MAP ? (this.m_data as JsonMap).size : -1
    }

    public GetMapKeys(): string[] {
        this.UpdateLastAccessTime()
        const keys: string[] = []

        if (this.m_type === NodeTypes.JSON_MAP) {
            (this.m_data as JsonMap).forEach((val, map_key) => {
                keys.push(map_key)
            })
        }

        return keys
    }

    public GetMapVals(): JsonTreeNode[] {
        this.UpdateLastAccessTime()
        const vals: JsonTreeNode[] = []

        if (this.m_type === NodeTypes.JSON_MAP) {
            (this.m_data as JsonMap).forEach((map_val) => {
                vals.push(map_val)
            })
        }

        return vals
    }

}