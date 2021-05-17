import Matter from 'matter-js';
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

  // We should re-arrange the viewport to be centered on our player.
  const viewportCoordinate = calculateViewportCoordinate(player.gameElement.coordinate, viewportDimension);
  updateViewportCoordinate(viewportCoordinate);

  const {pixiSprite: playerSprite} = player.gameElement;

  if (playerSprite) {
    const position = calculatePositionRelativeToViewport(playerSprite, getViewport(state).coordinate);

    playerSprite.position.set(position.x, position.y);
  }

  renderer.resize(viewportDimension.width, viewportDimension.height);
}

export async function onLoad(
  getState: GetState,
  world: Matter.World,
  stage: PIXI.Container,
  view: HTMLCanvasElement,
  updatePlayerMatterBody: CallbackWithArg<Matter.Body>,
  updatePlayerSprite: CallbackWithArg<PIXI.Sprite>
): Promise<void> {
  // Do not append the game view to the DOM, until the assets are loaded.
  await loadGameAssets();

  document.body.appendChild(view);

  setupWorld(getState, world, stage, updatePlayerMatterBody, updatePlayerSprite);
}

/**
 * Load game assets as a side-effect (no return value).
 * Currently these assets are just a sprite sheet.
 */

async function loadGameAssets(): Promise<void> {
  return new Promise((res, rej) => {
    const loader = PIXI.Loader.shared;
    loader.add('rabbit', './assets/simpleSpriteSheet.json');

    loader.add('spaceship', './assets/sprites/nightraiderfixed.png');

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
function setupWorld(
  getState: GetState,
  world: Matter.World,
  stage: PIXI.Container,
  updatePlayerMatterBody: CallbackWithArg<Matter.Body>,
  updatePlayerSprite: CallbackWithArg<PIXI.Sprite>
) {
  const state = getState();

  const player = getPlayer(state);

  const spaceshipPosition = calculatePositionRelativeToViewport(
    player.gameElement.coordinate,
    getViewport(state).coordinate
  );

  const spaceshipPixi = new PIXI.Sprite(PIXI.Texture.from('spaceship'));
  spaceshipPixi.anchor.set(0.5, 0.5);

  spaceshipPixi.position.set(spaceshipPosition.x, spaceshipPosition.y);

  const spaceshipMatter = Matter.Bodies.rectangle(
    // Game and matter coordinates have a one-to-one mapping.
    player.gameElement.coordinate.x,
    player.gameElement.coordinate.y,
    // We use dimensions of our sprite.
    spaceshipPixi.width,
    spaceshipPixi.height,
    {
      // Approximate mass of Falcon 9.
      mass: 550000
    }
  );

  Matter.Composite.add(world, spaceshipMatter);
  updatePlayerMatterBody(spaceshipMatter);

  stage.addChild(spaceshipPixi);
  updatePlayerSprite(spaceshipPixi);
}
