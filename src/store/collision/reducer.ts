import {Reducer} from 'redux';

import {CollisionAction, CollisionActionTypesEnum} from './action';

type CollisionTimestampMap = Map<string, number>;

export interface CollisionState {
  collisionTimestampMapById: Map<string, CollisionTimestampMap>;
}

const initialState: CollisionState = {
  collisionTimestampMapById: new Map<string, CollisionTimestampMap>()
};

export const collisionReducer: Reducer<CollisionState, CollisionAction> = (
  state: CollisionState = initialState,
  action: CollisionAction
) => {
  switch (action.type) {
    case CollisionActionTypesEnum.UPDATE_COLLISION_TIMESTAMP: {
      const updatedCollisionTimestampMapById = new Map(state.collisionTimestampMapById);
      const {collisionTimestamp, gameElementImpactingId, gameElementImpactedId} = action;

      // Initialize map for the impacting element.
      if (!updatedCollisionTimestampMapById.has(gameElementImpactingId))
        updatedCollisionTimestampMapById.set(gameElementImpactingId, new Map<string, number>());

      updatedCollisionTimestampMapById.get(gameElementImpactingId)?.set(gameElementImpactedId, collisionTimestamp);

      return {...state, collisionTimestampMapById: updatedCollisionTimestampMapById};
    }
    case CollisionActionTypesEnum.REMOVE_GAME_ELEMENT_IMPACTING_ID: {
      const updatedCollisionTimestampMapById = new Map(state.collisionTimestampMapById);
      const {gameElementId} = action;

      const gameElementImpactingIds = updatedCollisionTimestampMapById.keys();
      for (const gameElementImpactingId of gameElementImpactingIds) {
        const gameElementImpactedIds = updatedCollisionTimestampMapById.get(gameElementImpactingId);
        gameElementImpactedIds?.delete(gameElementId);
      }

      updatedCollisionTimestampMapById.delete(gameElementId);

      return {...state, collisionTimestampMapById: updatedCollisionTimestampMapById};
    }
    default:
      return state;
  }
};
