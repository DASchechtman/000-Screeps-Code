import { INVASION_EVENT, LOAD_EVENT, REPAIR_EVENT, RUN_EVENT, SAVE_EVENT } from "../Constants/EventConsts"
import { GameObject } from "../GameObject"

export class EventManager {
    
    private static instance: EventManager | null = null

    private observers_list: Array<GameObject>

    private constructor() {
        this.observers_list = new Array()
    }

    static Inst(): EventManager {
        if (!this.instance) {
            this.instance = new EventManager()
        }
        return this.instance
    }

    Add(observer: GameObject): void {
        this.observers_list.push(observer)
    }

    Remove(observer: GameObject): void {
        const index = this.observers_list.indexOf(observer)
        delete this.observers_list[index]
    }

    Notify(event_type: number): void {
        let i = 0;
        while (i < this.observers_list.length) {
            const observer = this.observers_list[i]
            switch(event_type) {
                case SAVE_EVENT: {
                    observer.OnSave()
                    break
                }
                case LOAD_EVENT: {
                    observer.OnLoad()
                    break
                }
                case RUN_EVENT: {
                    observer.OnRun()
                    break
                }
                case INVASION_EVENT: {
                    observer.OnInvasion()
                    break
                }
                case REPAIR_EVENT: {
                    observer.OnRepair()
                    break
                }
            }
            i++
        }
    }
}