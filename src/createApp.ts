import * as PIXI from 'pixi.js';

import {getPlayer} from './store/player/selector';
import {GetState} from './store/store';
import {getViewport} from './store/viewport/selector';
import {Callback, CallbackWithArg, Coordinate, Renderer} from './type';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';

/**
 * Browser.
 */

export function setupKeybinds(
  handleKeydown: CallbackWithArg<KeyboardEvent>,
  handleKeyup: CallbackWithArg<KeyboardEvent>
): void {
  window.addEventListener('keydown', handleKeydown, false);
  window.addEventListener('keyup', handleKeyup, false);
}

/**
 * PIXI.
 */

export function createApp(getState: GetState): PIXI.Application {
  const state = getState();

  const {width, height} = getViewport(state).dimension;

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
  getState: GetState,
  renderer: Renderer,
  updateViewportCoordinate: CallbackWithArg<Coordinate>
): Promise<void> {
  const state = getState();

  const viewportDimension = getViewport(state).dimension;

  const player = getPlayer(state);

  // We should re-arrange the viewport to be centered on our humble bird.
  const viewportCoordinate = calculateViewportCoordinate(player.gameElement.coordinate, viewportDimension);
  updateViewportCoordinate(viewportCoordinate);

  const {sprite: playerSprite} = player.gameElement;

  if (playerSprite) {
    const position = calculatePositionRelativeToViewport(playerSprite, getViewport(state).coordinate);

    playerSprite.position.set(position.x, position.y);
  }

  renderer.resize(viewportDimension.width, viewportDimension.height);
}

export async function onLoad(
  getState: GetState,
  stage: PIXI.Container,
  view: HTMLCanvasElement,
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
    player.gameElement.coordinate,
    getViewport(state).coordinate
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
