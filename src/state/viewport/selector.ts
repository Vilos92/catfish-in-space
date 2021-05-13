import {Dimension} from '../../type';
import {State} from '../store';
import {ViewportState} from './reducer';

export const getViewport = (state: State): ViewportState => {
  return {...state.viewport, dimension: getViewportDimension()};
};

/**
 * Although this is not retrieved from state,
 * we couple this information to the Viewport state.
 */
export const getViewportDimension = (): Dimension => ({
  width: window.innerWidth,
  height: window.innerHeight
});
