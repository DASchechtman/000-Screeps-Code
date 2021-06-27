import { GameObject } from "../GameObject"

export class EventManager {
    public static readonly SAVE_EVENT = 0
    public static readonly LOAD_EVENT = 1
    public static readonly RUN_EVENT = 2
    public static readonly CREEP_DEATH_EVENT = 3
    public static readonly CREEP_CREATE_EVENT = 4
    public static readonly INVASION_EVENT = 5

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
                case EventManager.SAVE_EVENT: {
                    observer.OnSave()
                    break
                }
                case EventManager.LOAD_EVENT: {
                    observer.OnLoad()
                    break
                }
                case EventManager.RUN_EVENT: {
                    observer.OnRun()
                    break
                }
                case EventManager.INVASION_EVENT: {
                    observer.OnInvasion()
                    break
                }
            }
            i++
        }
    }
}