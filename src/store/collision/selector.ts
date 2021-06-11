import {State} from '../gameReducer';
import {CollisionState} from './reducer';

const getCollision = (state: State): CollisionState => state.collision;
export const getCollisionTimestamp = (state: State, impactingId: string, impactedId: string): number | undefined =>
  getCollision(state).collisionTimestampMapById.get(impactingId)?.get(impactedId);
