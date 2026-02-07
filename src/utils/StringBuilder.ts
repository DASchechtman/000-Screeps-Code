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

    public Resize(size: number) {
        this.chars.splice(size, this.chars.length - size)
    }

    public ResizeFromChar(str: string) {
        const INDEX = this.chars.indexOf(str.charAt(0))
        if (INDEX >= 0) {
            this.Resize(INDEX)
        }
    }

    public MapFrom(index: number, Fn: (str: string ) => string) {
        if (index < 0) { index = 0 }
        for (let i = index; i < this.chars.length; i++) {
            this.chars[i] = Fn(this.chars[i]).charAt(0)
        }
    }

    toString() {
        return this.chars.join('')
    }
}
