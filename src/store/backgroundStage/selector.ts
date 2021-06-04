import {State} from '../gameReducer';
import {BackgroundStageState, StarField} from './reducer';

const getBackgroundStage = (state: State): BackgroundStageState => state.backgroundStage;
export const getStarFieldA = (state: State): StarField => getBackgroundStage(state).starFieldA;
export const getStarFieldB = (state: State): StarField => getBackgroundStage(state).starFieldB;
