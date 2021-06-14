import { EventManager } from "./EventManager";

export abstract class GameObject {
    constructor() {
        EventManager.Inst().Add(this)
    }

    OnSave(): void {}
    OnLoad(): void {}
    OnRun(): void {}
    OnCreepDeath(): void {}
    OnCreepCreate(): void {}
}