import {State} from '../gameReducer';
import {BackgroundStageState, StarField} from './reducer';

const getBackgroundStage = (state: State): BackgroundStageState => state.backgroundStage;
export const getStarField = (state: State): StarField => getBackgroundStage(state).starField;
