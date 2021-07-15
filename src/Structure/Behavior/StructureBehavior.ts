import { JsonObj } from "../../CompilerTyping/Interfaces";
import { JsonType } from "../../CompilerTyping/Types";
import { HardDrive } from "../../Disk/HardDrive";
import { RoomWrapper } from "../../Room/RoomWrapper";

export abstract class StructureBehavior {
    abstract Load(struct: Structure): void
    abstract Run(struct: Structure, room: RoomWrapper): void
    abstract Save(struct: Structure): void

    private GetId(struct: Structure): string {
        return `${struct.id}${struct.room.name}`
    }

    protected GetBehavior(struct: Structure): JsonType | JsonObj {
        return HardDrive.Read(this.GetId(struct)).behavior
    }

    protected SaveBehavior(struct: Structure, data: JsonObj): void {
        let save_data = this.GetBehavior(struct)
        save_data = data
        HardDrive.Write(this.GetId(struct), save_data)
    }
}