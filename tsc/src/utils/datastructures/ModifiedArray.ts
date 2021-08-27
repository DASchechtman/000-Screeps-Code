export class ModifiedArray<T> extends Array<T> {
    remove(el: T) {
        const index = this.indexOf(el)
        this.splice(index, 1)
    }

    removeByIndex(index: number) {
        this.splice(index, 1)
    }
}