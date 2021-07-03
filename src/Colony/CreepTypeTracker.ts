import { BUILDER_BEHAVIOR, DEFENDER_BEHAVIOR, HARVEST_BEHAVIOR, UPGRADER_BEHAVIOR } from "../Constants/CreepBehaviorConsts"
import { CreepType, CreepTypeCollection } from "../CompilerTyping/Interfaces"

export class CreepTypeTracker {

    public static readonly LEVEL_RESERVED = -1
    public static readonly LEVEL_ONE = 1
    public static readonly LEVEL_TWO = 2
    public static readonly LEVEL_THREE = 3

    private m_Creep_catagories: Map<number, CreepTypeCollection>

    constructor() {
        this.m_Creep_catagories = new Map()

     
    }

    private GetLevel(type: number): number | undefined {
        let level: number | undefined

        switch (type) {
            case DEFENDER_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_RESERVED
                break
            }
            case HARVEST_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_ONE
                break
            }
            case UPGRADER_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_TWO
                break
            }
            case BUILDER_BEHAVIOR: {
                level = CreepTypeTracker.LEVEL_THREE
                break
            }
        }

        return level
    }

    Add(type: number, name: string): void {
        const level = this.GetLevel(type)
        if (level) {

            if (!this.m_Creep_catagories.has(level)) {
                const collection: CreepTypeCollection = {
                    level: level,
                    count: 0,
                    collection: new Map()
                }
                
                this.m_Creep_catagories.set(level, collection)
            }
            

            const type_array = this.m_Creep_catagories.get(level)!!.collection.get(type)

            const creep_type: CreepType = {
                creep_type: type,
                creep_name: name
            }

            if (type_array) {
                type_array.push(creep_type)
            }
            else {
                const type_collection = this.m_Creep_catagories.get(level)!!
                type_collection.collection.set(type, new Array())
                type_collection.collection.get(type)!!.push(creep_type)
            }

            this.m_Creep_catagories.get(level)!!.count++
        }
    }

    Remove(type: number, name: string): void {
        const level = this.GetLevel(type)
        if (level && this.m_Creep_catagories.has(level)) {
            const creep_list = this.m_Creep_catagories.get(level)!!.collection.get(type)

            if (creep_list) {
                let index = 0
                for (let creep of creep_list) {
                    if (creep.creep_name === name) {
                        break
                    }
                    index++
                }
                creep_list.splice(index, 1)
                this.m_Creep_catagories.get(level)!!.count--
            }
        }
    }

    GetTypeCount(type: number): number {
        let number_of_creeps = 0
        const level = this.GetLevel(type)

        if (level) {
            const list_len = this.m_Creep_catagories.get(level)?.collection.get(type)?.length
            if (list_len) {
                number_of_creeps = list_len
            }
        }

        return number_of_creeps
    } 

    GetLevelCount(level: number): number {
        let number_of_creeps = 0
        const count = this.m_Creep_catagories.get(level)?.count

        if (count) {
            number_of_creeps = count
        }

        return number_of_creeps
    }

    GetNamesByLevel(level: number): Array<string> {
        const names = new Array<string>()

        const level_collection = this.m_Creep_catagories.get(level)
        if (level_collection) {
            level_collection.collection.forEach((value, key) => {
                for (let type of value) {
                    names.push(type.creep_name)
                }
            })
        }

        return names
    }
}