export class StringBuilder {
    private chars: string[]

    public get length() {
        return this.chars.length
    }

    constructor(str?: string) {
        this.chars = []
        if (str != null) {
            this.chars.push(...str.split(''))
        }
    }

    public AppendChars(str: string) {
        this.chars.push(...str.split(''))
    }

    public InsertChars(index: number, str: string) {
        this.chars.splice(index, 0, ...str.split(''))
    }

    public ChangeCharAt(index: number, str: string) {
        if (index < 0 || index >= this.chars.length) {
            return false
        }
        this.chars[index] = str.charAt(0)
        return true
    }

    public RemoveCharAt(index: number) {
        this.chars.splice(index, 1)
    }

    public CharAt(index: number) {
        return this.chars.at(index)
    }

    public Pop() {
        this.chars.pop()
    }

    public Shift() {
        this.chars.shift()
    }

    toString() {
        return this.chars.join('')
    }
}
