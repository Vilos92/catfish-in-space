import {State} from '../gameReducer';
import {CollisionState} from './reducer';

const getCollision = (state: State): CollisionState => state.collision;
export const getCollisionTimestamp = (state: State, impactedId: string, impactingId: string): number | undefined =>
  getCollision(state).collisionTimestampMapById.get(impactedId)?.get(impactingId);
