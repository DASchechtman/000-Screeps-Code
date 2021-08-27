import { GameEntityTypes } from "../../consts/GameConstants";
import { ColonyMember } from "../../core/ColonyMember";
import { ColonyMemberKey, HoleyArray } from "../../types/Types";

export class ColonyMemberMap {
    private m_Member_map: Map<string, ColonyMember>
    private m_Type_map: HoleyArray<Array<ColonyMember>>

    constructor() {
        this.m_Member_map = new Map()
        this.m_Type_map = new Array()
    }

    Put(member: ColonyMember): void {
        let type_array = this.m_Type_map[member.GetType()]
        if (!type_array) {
            type_array = new Array()
            this.m_Type_map[member.GetType()] = type_array
        }

        type_array.push(member)

        if (!this.m_Member_map.has(member.GetID())) {
            this.m_Member_map.set(member.GetID(), member)
        }
    }

    GetByID(member_id: string): ColonyMember | undefined {
        return this.m_Member_map.get(member_id)
    }

    GetByType(member_type: GameEntityTypes): ColonyMember[] | undefined {
        return this.m_Type_map[member_type]
    }

    DeleteById(member_id: string): void {
        const member = this.m_Member_map.get(member_id)

        if (member) {
            const arr = this.m_Type_map[member.GetType()]
            if (arr) {
                this.m_Type_map[member.GetType()] = arr.filter((val) => {
                    const found_member = val.GetID() === member.GetID()
                    if (found_member) {
                        this.m_Member_map.delete(val.GetID())
                    }
                    return !found_member
                })
            }
            else {
                this.m_Member_map.delete(member_id)
            }
        }
    }

    DeleteByType(type: GameEntityTypes): void {
        const old_array = this.m_Type_map[type]
        if (old_array) {
            const new_array = old_array.filter((val): boolean => {
                this.m_Member_map.delete(val.GetID())
                return false
            })

            this.m_Type_map[type] = new_array
        }
    }

    ForEach(call_back_fnc: (member: ColonyMember) => void) {
        this.m_Member_map.forEach(call_back_fnc)
    }

    ForEachByType(type: GameEntityTypes, call_back_fnc: (member: ColonyMember) => void) {
        this.m_Type_map[type]?.forEach(call_back_fnc)
    }

    HasMember(member_id: string): boolean {
        return this.m_Member_map.has(member_id)
    }

    Size(): number {
        return this.m_Member_map.size
    }
}