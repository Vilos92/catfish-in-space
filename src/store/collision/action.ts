export enum CollisionActionTypesEnum {
  UPDATE_LAST_COLLISION_TIMESTAMP = 'UPDATE_LAST_COLLISION_TIMESTAMP',
  REMOVE_GAME_ELEMENT_IMPACTING_ID = 'REMOVE_GAME_ELEMENT_IMPACTING_ID'
}

export interface UpdateLastCollisionTimestampAction {
  type: CollisionActionTypesEnum.UPDATE_LAST_COLLISION_TIMESTAMP;
  lastCollisionTimestamp: number;
  gameElementImpactingId: string;
  gameElementImpactedId: string;
}

export interface RemoveGameElementImpactingIdAction {
  type: CollisionActionTypesEnum.REMOVE_GAME_ELEMENT_IMPACTING_ID;
  gameElementId: string;
}

export type CollisionAction = UpdateLastCollisionTimestampAction | RemoveGameElementImpactingIdAction;

export function updateLastCollisionTimestampAction(
  lastCollisionTimestamp: number,
  gameElementImpactingId: string,
  gameElementImpactedId: string
): UpdateLastCollisionTimestampAction {
  return {
    type: CollisionActionTypesEnum.UPDATE_LAST_COLLISION_TIMESTAMP,
    lastCollisionTimestamp,
    gameElementImpactingId,
    gameElementImpactedId
  };
}

export function removeGameElementImpactingIdAction(gameElementId: string): RemoveGameElementImpactingIdAction {
  return {
    type: CollisionActionTypesEnum.REMOVE_GAME_ELEMENT_IMPACTING_ID,
    gameElementId
  };
}
