import {Coordinate, Dimension} from '../../type';
import {ViewportState} from './reducer';

export const getViewportCoordinate = (state: ViewportState): Coordinate => state.coordinate;

/**
 * Although this is not retrieved from state,
 * we couple this information to the Viewport state.
 */
export const getViewportDimension = (): Dimension => ({
  width: window.innerWidth,
  height: window.innerHeight
});
