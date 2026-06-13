import { RoomData } from "Rooms/RoomData";
import { CreepQueueData } from "./CreepBehaviors.ts/Utils/CreepUtils";
import { EntityTypes } from "./CreepBehaviors.ts/BehaviorTypes";

export class CreepScheduler {
  private room_data = RoomData.GetRoomData();
  private HarvestPriority = () => {
    return 1;
  };

  private RepairPriority = () => {
    if (this.room_data.AreThereEnemiesInRoom()) {
      return -1;
    }
    return 2;
  };

  private BuildPriority = () => {
    if (this.room_data.AreThereEnemiesInRoom()) {
      return -1;
    }

    return 3;
  };

  private SupplierPriority = () => {
    const NUM_HARVESTERS = this.room_data.NumOfCreepsInRoom(EntityTypes.HARVESTER_TYPE);
    const NUM_CONTAINERS = this.room_data.NumOfStructuresInRoom(STRUCTURE_CONTAINER)
    const NUM_SUPPLIERS = this.room_data.NumOfCreepsInRoom(EntityTypes.STRUCTURE_SUPPLIER_TYPE)
    if (this.room_data.AreThereEnemiesInRoom()) {
      return -1;
    }
    else if (NUM_SUPPLIERS === 0 && NUM_HARVESTERS > 0 && NUM_CONTAINERS > 0) {
        return 0
    }
    return 4;
  };

  private UpgradePriority = () => {
    if (this.room_data.AreThereEnemiesInRoom()) {
      return -1;
    }
    return 5;
  };

  private AttackPriority = () => {
    if (this.room_data.AreThereEnemiesInRoom() && this.room_data.NumOfCreepsInRoom(EntityTypes.HARVESTER_TYPE) > 0) {
      return 0;
    } else if (!this.room_data.AreThereEnemiesInRoom()) {
      return 6;
    }

    return 2;
  };

  public GetCreepsToSpawn(
    GetCreepBody: (body: BodyPartConstant[], energy_limit: number | null) => BodyPartConstant[]
  ): CreepQueueData[] {
    const QUEUE = new Array<{ type: EntityTypes; priority: number; energy_limit: number | null }>();

    const MAX_HARVESTERS = Math.max(2, this.room_data.NumOfStructuresInRoom(STRUCTURE_CONTAINER))
    const MAX_TOWERS = this.room_data.NumOfStructuresInRoom(STRUCTURE_TOWER)
    const MAX_CONTAINERS = this.room_data.NumOfStructuresInRoom(STRUCTURE_CONTAINER)
    const EXISTING_HARVESTERS = this.room_data.NumOfCreepsInRoom(EntityTypes.HARVESTER_TYPE)
    const EXISTING_SUPPLIERS = this.room_data.NumOfCreepsInRoom(EntityTypes.STRUCTURE_SUPPLIER_TYPE)

    const STORAGE = Game.getObjectById(this.room_data.GetOwnedStructureIds(STRUCTURE_STORAGE)[0])

    for (let i = EXISTING_HARVESTERS; i < MAX_HARVESTERS; i++) {
      QUEUE.push({ type: EntityTypes.HARVESTER_TYPE, priority: this.HarvestPriority(), energy_limit: EXISTING_HARVESTERS ? 1200 : 300 });
    }

    if (this.room_data.AreThereDamagedStructuresInRoom()) {
      for (let i = this.room_data.NumOfCreepsInRoom(EntityTypes.REPAIR_TYPE); i < 1; i++) {
        QUEUE.push({ type: EntityTypes.REPAIR_TYPE, priority: this.RepairPriority(), energy_limit: 1200 });
      }
    }

    if (this.room_data.AreThereConstructionSitesInRoom()) {
      for (let i = this.room_data.NumOfCreepsInRoom(EntityTypes.BUILDER_TYPE); i < 1; i++) {
        QUEUE.push({ type: EntityTypes.BUILDER_TYPE, priority: this.BuildPriority(), energy_limit: 1200 });
      }
    }

    for (let i = EXISTING_SUPPLIERS; i < MAX_TOWERS + 1; i++) {
      QUEUE.push({ type: EntityTypes.STRUCTURE_SUPPLIER_TYPE, priority: this.SupplierPriority(), energy_limit: EXISTING_SUPPLIERS ? 1200 : 300 });
    }

    for (let i = this.room_data.NumOfCreepsInRoom(EntityTypes.UPGRADER_TYPE); i < 1; i++) {
      QUEUE.push({ type: EntityTypes.UPGRADER_TYPE, priority: this.UpgradePriority(), energy_limit: 1200 });
    }

    for (let i = this.room_data.NumOfCreepsInRoom(EntityTypes.ATTACK_TYPE); i < 3; i++) {
      QUEUE.push({ type: EntityTypes.ATTACK_TYPE, priority: this.AttackPriority(), energy_limit: this.room_data.AreThereEnemiesInRoom() ? null : 1200 });
    }

    return QUEUE
      .filter(data => data.priority >= 0)
      .sort((a, b) => a.priority - b.priority)
      .map(data => {
        const BODY = new Array<BodyPartConstant>();

        switch (data.type) {
          case EntityTypes.HARVESTER_TYPE: {
            BODY.push(WORK, CARRY, MOVE);
            break;
          }
          case EntityTypes.BUILDER_TYPE: {
            BODY.push(WORK, CARRY, MOVE);
            break;
          }
          case EntityTypes.REPAIR_TYPE: {
            BODY.push(WORK, CARRY, MOVE);
            break;
          }
          case EntityTypes.STRUCTURE_SUPPLIER_TYPE: {
            BODY.push(CARRY, CARRY, MOVE);
            break;
          }
          case EntityTypes.UPGRADER_TYPE: {
            BODY.push(WORK, CARRY, MOVE);
            break;
          }
          case EntityTypes.ATTACK_TYPE: {
            BODY.push(ATTACK, ATTACK, MOVE);
            break;
          }
        }

        let queue: CreepQueueData = {
          body: GetCreepBody(BODY, data.energy_limit),
          limit: data.energy_limit,
          creep_type: data.type
        };

        return queue;
      });
  }
}
