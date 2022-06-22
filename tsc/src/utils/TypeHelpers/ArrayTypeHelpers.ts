export function IsTuple(data: unknown, types_contained: string[]): boolean {
    const is_right_type_and_len = data instanceof Array && data.length === types_contained.length

    if (!is_right_type_and_len) {
        return false
    }

    let is_tuple = true
    const tuple = data as Array<any>

    for (let i = 0; i < tuple.length; i++) {
        const types_dont_match = typeof tuple[i] !== types_contained[i]
        if (types_dont_match) {
            is_tuple = false
            break
        }
    }

    return is_tuple
}