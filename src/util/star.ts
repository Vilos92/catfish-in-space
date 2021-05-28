import * as PIXI from 'pixi.js';

import {updateStarFieldAction} from '../store/backgroundStage/action';
import {StarField} from '../store/backgroundStage/reducer';
import {Dispatch, GetState} from '../store/gameReducer';
import {getViewport} from '../store/viewport/selector';
import {Coordinate} from '../type';
import {calculatePositionRelativeToViewport} from './viewport';

export function addInitialStars(getState: GetState, dispatch: Dispatch, stage: PIXI.Container): void {
  const state = getState();
  const viewport = getViewport(state);

  const {width, height} = viewport.dimension;

  // 1 star for every 256 pixels.
  const starDensity = 1 / 256;

  const starCount = Math.floor(width * height * starDensity);

  const starField: StarField = {};

  for (let i = 0; i < starCount; i++) {
    const x = viewport.coordinate.x + Math.floor(width * Math.random());
    const y = viewport.coordinate.y + Math.floor(height * Math.random());

    const coordinate = {x, y};

    const star = createStarGraphic(viewport.coordinate, {x, y});

    starField[x] = starField[x] ?? {};
    starField[x][y] = {
      coordinate,
      rotation: 0,
      pixiSprite: star
    };

    stage.addChild(star);
  }

  dispatch(updateStarFieldAction(starField));
}

export function createStarGraphic(viewportCoordinate: Coordinate, coordinate: Coordinate): PIXI.Graphics {
  const position = calculatePositionRelativeToViewport(coordinate, viewportCoordinate);

  const starSize = Math.random() * 2;
  const alpha = Math.random();

  const starGraphics = new PIXI.Graphics();
  starGraphics.beginFill(0xffffff, alpha);
  starGraphics.lineStyle(0, 0, 1.0);
  starGraphics.drawCircle(0, 0, starSize);
  starGraphics.endFill();
  starGraphics.position.set(position.x, position.y);

  return starGraphics;
}
