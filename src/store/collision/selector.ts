import {State} from '../gameReducer';
import {CollisionState} from './reducer';

const getCollision = (state: State): CollisionState => state.collision;
export const getLastCollisionTimestamp = (state: State, impactedId: string, impactingId: string): number | undefined =>
  getCollision(state).lastCollisionTimestampMapById.get(impactedId)?.get(impactingId);
