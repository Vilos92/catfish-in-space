import * as PIXI from 'pixi.js';

import {getPlayer} from './state/player/selector';
import {GetState} from './state/store';
import {getViewportCoordinate, getViewportDimension} from './state/viewport/selector';
import {Callback, CallbackWithArg, Coordinate, Renderer} from './type';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';

/**
 * Helpers.
 */

export function createApp(): PIXI.Application {
  const {width, height} = getViewportDimension();

  return new PIXI.Application({
    backgroundColor: 0xd3d3d3,
    width,
    height,
    resolution: window.devicePixelRatio,
    autoDensity: true
  });
}

export function setupWindowHooks(onload: Callback, resize: Callback): void {
  window.onload = onload;
  window.addEventListener('resize', resize);
}

export async function onResize(
  renderer: Renderer,
  getState: GetState,
  updateViewportCoordinate: CallbackWithArg<Coordinate>
): Promise<void> {
  const viewportDimension = getViewportDimension();
  const state = getState();

  const player = getPlayer(state);

  // We should re-arrange the viewport to be centered on our humble bird.
  const viewportCoordinate = calculateViewportCoordinate(player.gameSprite, viewportDimension);
  updateViewportCoordinate(viewportCoordinate);

  const {sprite: playerSprite} = player.gameSprite;

  if (playerSprite) {
    const position = calculatePositionRelativeToViewport(playerSprite, getViewportCoordinate(state.viewport));

    playerSprite.position.set(position.x, position.y);
  }

  renderer.resize(viewportDimension.width, viewportDimension.height);
}

export async function onLoad(
  stage: PIXI.Container,
  view: HTMLCanvasElement,
  getState: GetState,
  updatePlayerSprite: CallbackWithArg<PIXI.AnimatedSprite>
): Promise<void> {
  // Do not append the game view to the DOM, until the assets are loaded.
  await loadGameAssets();

  document.body.appendChild(view);

  setupStage(stage, getState, updatePlayerSprite);
}

/**
 * Load game assets as a side-effect (no return value).
 * Currently these assets are just a sprite sheet.
 */

async function loadGameAssets(): Promise<void> {
  return new Promise((res, rej) => {
    const loader = PIXI.Loader.shared;
    loader.add('rabbit', './assets/simpleSpriteSheet.json');

    loader.onComplete.once(() => {
      res();
    });

    loader.onError.once(() => {
      rej();
    });

    loader.load();
  });
}

/**
 * Setup the stage of the game, by adding initial elements.
 */
function setupStage(
  stage: PIXI.Container,
  getState: GetState,
  updatePlayerSprite: CallbackWithArg<PIXI.AnimatedSprite>
) {
  const state = getState();

  const player = getPlayer(state);

  const birdPosition = calculatePositionRelativeToViewport(
    player.gameSprite.coordinate,
    getViewportCoordinate(state.viewport)
  );

  const birdFromSprite = getBird();
  birdFromSprite.anchor.set(0.5, 0.5);

  birdFromSprite.position.set(birdPosition.x, birdPosition.y);

  stage.addChild(birdFromSprite);
  updatePlayerSprite(birdFromSprite);
}

/**
 * Test method which loads a bird from the sprite sheet, and returns the AnimatedSprite.
 */
function getBird(): PIXI.AnimatedSprite {
  const bird = new PIXI.AnimatedSprite([
    PIXI.Texture.from('birdUp.png'),
    PIXI.Texture.from('birdMiddle.png'),
    PIXI.Texture.from('birdDown.png')
  ]);

  bird.loop = true;
  bird.animationSpeed = 0.1;
  bird.play();
  bird.scale.set(3);

  return bird;
}
