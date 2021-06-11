import {Reducer} from 'redux';

import {CollisionAction, CollisionActionTypesEnum} from './action';

type LastCollisionTimestampMap = Map<string, number>;

export interface CollisionState {
  lastCollisionTimestampMapById: Map<string, LastCollisionTimestampMap>;
}

const initialState: CollisionState = {
  lastCollisionTimestampMapById: new Map<string, LastCollisionTimestampMap>()
};

export const collisionReducer: Reducer<CollisionState, CollisionAction> = (
  state: CollisionState = initialState,
  action: CollisionAction
) => {
  switch (action.type) {
    case CollisionActionTypesEnum.UPDATE_LAST_COLLISION_TIMESTAMP: {
      const updatedLastCollisionTimestampMapById = new Map(state.lastCollisionTimestampMapById);
      const {lastCollisionTimestamp, gameElementImpactingId, gameElementImpactedId} = action;

      // Initialize map for the impacting element.
      if (!updatedLastCollisionTimestampMapById.has(gameElementImpactingId))
        updatedLastCollisionTimestampMapById.set(gameElementImpactingId, new Map<string, number>());

      updatedLastCollisionTimestampMapById
        .get(gameElementImpactingId)
        ?.set(gameElementImpactedId, lastCollisionTimestamp);

      return {...state, lastCollisionTimestampMapById: updatedLastCollisionTimestampMapById};
    }
    case CollisionActionTypesEnum.REMOVE_GAME_ELEMENT_IMPACTING_ID: {
      const updatedLastCollisionTimestampMapById = new Map(state.lastCollisionTimestampMapById);
      const {gameElementId} = action;

      const gameElementImpactingIds = updatedLastCollisionTimestampMapById.keys();
      for (const gameElementImpactingId of gameElementImpactingIds) {
        const gameElementImpactedIds = updatedLastCollisionTimestampMapById.get(gameElementImpactingId);
        gameElementImpactedIds?.delete(gameElementId);
      }

      updatedLastCollisionTimestampMapById.delete(gameElementId);

      return {...state, lastCollisionTimestampMapById: updatedLastCollisionTimestampMapById};
    }
    default:
      return state;
  }
};
