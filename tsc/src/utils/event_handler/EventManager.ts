import { EventTypes } from "../../consts/GameConstants";
import { HoleyArray } from "../../types/Types";

export class EventManager {
    private static inst: EventManager | null = null
    
    private events_list: HoleyArray<(() => void)[]>
    
    private constructor() {
        this.events_list = []
    }

    public static GetInst(): EventManager {
        if (this.inst === null) {
            this.inst = new EventManager()
        }

        return this.inst
    }

    RunEvent(event: EventTypes) {
        this.events_list[event]?.forEach((call_back) => {
            call_back()
        })
    }

    AddEventMethod(event: EventTypes, call_back: () => void) {
        if (!this.events_list[event]) {
            this.events_list[event] = []
        }

        this.events_list[event]?.push(call_back)
    }

    RemoveEventMethod(event: EventTypes, call_back: () => void) {
        if (this.events_list[event]) {
            const index = this.events_list[event]!!.indexOf(call_back)
            if (index !== -1) {
                this.events_list[event]?.splice(index, 1)
            }
        }
    }

}