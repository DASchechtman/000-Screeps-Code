"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColonyMemberMap = void 0;
class ColonyMemberMap {
    constructor() {
        this.m_Member_map = new Map();
        this.m_Type_map = [];
    }
    Put(member) {
        let type_array = this.m_Type_map[member.GetType()];
        if (!type_array) {
            type_array = [];
            this.m_Type_map[member.GetType()] = type_array;
        }
        type_array.push(member);
        if (!this.m_Member_map.has(member.GetID())) {
            this.m_Member_map.set(member.GetID(), member);
        }
    }
    GetByID(member_id) {
        return this.m_Member_map.get(member_id);
    }
    GetByType(member_type) {
        return this.m_Type_map[member_type];
    }
    DeleteById(member_id) {
        const member = this.m_Member_map.get(member_id);
        if (member) {
            const arr = this.m_Type_map[member.GetType()];
            if (arr) {
                this.m_Type_map[member.GetType()] = arr.filter((val) => {
                    const found_member = val.GetID() === member.GetID();
                    if (found_member) {
                        this.m_Member_map.delete(val.GetID());
                    }
                    return !found_member;
                });
            }
            else {
                this.m_Member_map.delete(member_id);
            }
        }
    }
    DeleteByType(type) {
        const old_array = this.m_Type_map[type];
        if (old_array) {
            const new_array = old_array.filter((val) => {
                this.m_Member_map.delete(val.GetID());
                return false;
            });
            this.m_Type_map[type] = new_array;
        }
    }
    ForEach(call_back_fnc) {
        this.m_Member_map.forEach(call_back_fnc);
    }
    ForEachByType(type, call_back_fnc) {
        var _a;
        (_a = this.m_Type_map[type]) === null || _a === void 0 ? void 0 : _a.forEach(call_back_fnc);
    }
    HasMember(member_id) {
        return this.m_Member_map.has(member_id);
    }
    Size() {
        return this.m_Member_map.size;
    }
}
exports.ColonyMemberMap = ColonyMemberMap;
