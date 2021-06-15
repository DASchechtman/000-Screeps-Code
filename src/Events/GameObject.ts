import { EventManager } from "./EventManager";

export abstract class GameObject {
    constructor() {
        EventManager.Inst().Add(this)
    }

    OnLoad(): void {}
    OnRun(): void {}
    OnSave(): void {}
}