import {ViewportState} from './reducer';
import {Coordinate, Dimension} from '../../type';

export const getViewportCoordinate = (state: ViewportState): Coordinate => state.coordinate;

/**
 * Although this does not retrieve this from state,
 * we couple this information to the Viewport state.
 */
export const getViewportDimension = (): Dimension => ({
  width: window.innerWidth,
  height: window.innerHeight
});
