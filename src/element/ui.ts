import * as PIXI from 'pixi.js';

import {Dimension, DisplayElement} from '../type';

/**
 * Constants.
 */

const gameOverTextStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 48,
  fontWeight: 'bold',
  fill: ['#ffffff', '#65dc98'], // gradient
  stroke: '#4a1850',
  strokeThickness: 5,
  dropShadowDistance: 6,
  wordWrap: true,
  wordWrapWidth: 440,
  lineJoin: 'round'
});

/**
 * Element creators.
 */

export function createGameOverTextDisplayElement(viewportDimension: Dimension): DisplayElement {
  const gameOverText = new PIXI.Text('GAME OVER', gameOverTextStyle);

  const gameOverTextCoordinate = {
    x: viewportDimension.width / 2 - gameOverText.width / 2,
    y: viewportDimension.height / 2 - gameOverText.height / 2
  };

  gameOverText.position.set(gameOverTextCoordinate.x, gameOverTextCoordinate.y);

  return {
    pixiSprite: gameOverText,
    coordinate: gameOverTextCoordinate,
    rotation: 0
  };
}
