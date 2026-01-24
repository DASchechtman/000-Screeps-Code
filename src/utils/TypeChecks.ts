import { Json } from "Consts";

export function IsJsonType(test_obj: any): test_obj is Json {
    const BASE_TYPES = ['number', 'string', 'boolean']

    const CheckIfBaseType = (obj: any) => {
        if (BASE_TYPES.includes(typeof obj)) {
            return true
        }
        else if (obj === null) {
            return true
        }

        return false
    }

    const CheckIfJsonType = (obj: any): boolean => {
        let ret = false
        if (CheckIfBaseType(obj)) { return true }
        if (!Array.isArray(obj) || typeof obj !== 'object') { return false }

        for (let key in obj) {
            ret = CheckIfJsonType(obj[key])
            if (ret === false) { break }
        }

        return ret
    }


    return CheckIfJsonType(test_obj)
}
