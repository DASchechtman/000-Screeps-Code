export enum Behavior {
    NONE = -1,
    HARVEST,
    UPGRADER,
    DEFENDER,
    BUILDER,
    REPAIR
}

export enum ActionDistance {
    REPAIR = 3,
    BUILD = 3,
    UPGRADE = 3,
    RANGED_ATTACK = 3,
    ATTACK = 1,
    TRANSFER = 1,
    HARVEST = 1,
    CHANGE_SIGN = 1
}