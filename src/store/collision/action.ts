export enum CollisionActionTypesEnum {
  UPDATE_COLLISION_TIMESTAMP = 'UPDATE_COLLISION_TIMESTAMP',
  REMOVE_GAME_ELEMENT_IMPACTING_ID = 'REMOVE_GAME_ELEMENT_IMPACTING_ID'
}

export interface UpdateCollisionTimestampAction {
  type: CollisionActionTypesEnum.UPDATE_COLLISION_TIMESTAMP;
  collisionTimestamp: number;
  gameElementImpactingId: string;
  gameElementImpactedId: string;
}

export interface RemoveGameElementImpactingIdAction {
  type: CollisionActionTypesEnum.REMOVE_GAME_ELEMENT_IMPACTING_ID;
  gameElementId: string;
}

export type CollisionAction = UpdateCollisionTimestampAction | RemoveGameElementImpactingIdAction;

export function updateCollisionTimestampAction(
  collisionTimestamp: number,
  gameElementImpactingId: string,
  gameElementImpactedId: string
): UpdateCollisionTimestampAction {
  return {
    type: CollisionActionTypesEnum.UPDATE_COLLISION_TIMESTAMP,
    collisionTimestamp,
    gameElementImpactingId,
    gameElementImpactedId
  };
}

export function removeGameElementByIdAction(gameElementId: string): RemoveGameElementImpactingIdAction {
  return {
    type: CollisionActionTypesEnum.REMOVE_GAME_ELEMENT_IMPACTING_ID,
    gameElementId
  };
}
