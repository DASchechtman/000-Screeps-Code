import { JsonObj } from "../CompilerTyping/Interfaces";
import { HardDrive } from "../Disk/HardDrive";
import { RoomWrapper } from "../Room/RoomWrapper";

export abstract class SharedBehavior {
    abstract Load(id: string): void
    abstract Run(id: string, room: RoomWrapper): void
    abstract Save(id: string): void

    protected GetBehavior(id: string): JsonObj {
        const data = HardDrive.Read(id)
        data.behavior = {}
        return data.behavior
    }

    protected SaveBehavior(id: string, data: JsonObj) {
        const save_data = HardDrive.Read(id)
        save_data.behavior = data
        HardDrive.Write(id, save_data)
    }
}