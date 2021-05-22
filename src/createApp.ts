import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {pushGameElementAction} from './store/gameElement/action';
import {Dispatch, GetState} from './store/gameReducer';
import {keyDownAction, keyUpAction} from './store/keyboard/action';
import {updatePlayerMatterBodyAction, updatePlayerSpriteAction} from './store/player/action';
import {getPlayer} from './store/player/selector';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {ViewportState} from './store/viewport/reducer';
import {getViewport} from './store/viewport/selector';
import {Callback, CallbackWithArg, Coordinate, GameElement, KeyCodesEnum, Renderer} from './type';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';

/**
 * Browser.
 */

export function setupKeybinds(dispatch: Dispatch): void {
  const handleKeydown: CallbackWithArg<KeyboardEvent> = (event: KeyboardEvent): void => {
    const keyCode = event.code;
    dispatch(keyDownAction(keyCode as KeyCodesEnum));
  };

  const handleKeyup: CallbackWithArg<KeyboardEvent> = (event: KeyboardEvent): void => {
    const keyCode = event.code;
    dispatch(keyUpAction(keyCode as KeyCodesEnum));
  };

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

export async function onResize(getState: GetState, dispatch: Dispatch, renderer: Renderer): Promise<void> {
  const state = getState();

  const viewportDimension = getViewport(state).dimension;

  const player = getPlayer(state);

  // We should re-arrange the viewport to be centered on our player.
  const viewportCoordinate = calculateViewportCoordinate(player.gameElement.coordinate, viewportDimension);
  dispatch(updateViewportCoordinateAction(viewportCoordinate));

  const {pixiSprite: playerSprite} = player.gameElement;

  if (playerSprite) {
    const position = calculatePositionRelativeToViewport(playerSprite, getViewport(state).coordinate);

    playerSprite.position.set(position.x, position.y);
  }

  renderer.resize(viewportDimension.width, viewportDimension.height);
}

export async function onLoad(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  stage: PIXI.Container,
  view: HTMLCanvasElement
): Promise<void> {
  // Do not append the game view to the DOM, until the assets are loaded.
  await loadGameAssets();

  document.body.appendChild(view);

  setupWorld(getState, dispatch, world, stage);
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
function setupWorld(getState: GetState, dispatch: Dispatch, world: Matter.World, stage: PIXI.Container) {
  const state = getState();
  const viewport = getViewport(state);
  const player = getPlayer(state);

  const spaceshipPosition = calculatePositionRelativeToViewport(player.gameElement.coordinate, viewport.coordinate);

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
  dispatch(updatePlayerMatterBodyAction(spaceshipMatter));

  stage.addChild(spaceshipPixi);
  dispatch(updatePlayerSpriteAction(spaceshipPixi));

  const testRectangle1 = createTestRectangle(viewport, {x: 300, y: -100});
  const testRectangle2 = createTestRectangle(viewport, {x: -300, y: 100});
  const testRectangle3 = createTestRectangle(viewport, {x: 0, y: 400});
  const testRectangle4 = createTestRectangle(viewport, {x: 0, y: -400});
  addGameElement(dispatch, world, stage, testRectangle1);
  addGameElement(dispatch, world, stage, testRectangle2);
  addGameElement(dispatch, world, stage, testRectangle3);
  addGameElement(dispatch, world, stage, testRectangle4);
}

function createTestRectangle(viewport: ViewportState, coordinate: Coordinate): GameElement {
  const width = 300;
  const height = 200;

  const position = calculatePositionRelativeToViewport(coordinate, viewport.coordinate);

  const graphics = new PIXI.Graphics();

  graphics.beginFill(0xffff00);
  graphics.lineStyle(5, 0xffff00);
  // MatterJS centers automatically, whereas with PixiJS we must set anchor or shift by half of width and height.
  graphics.drawRect(position.x, position.y, width, height);
  graphics.pivot.set(position.x + width / 2, position.y + height / 2);

  const matter = Matter.Bodies.rectangle(coordinate.x, coordinate.y, graphics.width, graphics.height, {
    mass: 550000
  });

  return {
    coordinate: coordinate,
    rotation: 0,
    matterBody: matter,
    pixiSprite: graphics
  };
}

function addGameElement(dispatch: Dispatch, world: Matter.World, stage: PIXI.Container, gameElement: GameElement) {
  if (gameElement.matterBody) Matter.Composite.add(world, gameElement.matterBody);

  if (gameElement.pixiSprite) stage.addChild(gameElement.pixiSprite);

  dispatch(pushGameElementAction(gameElement));
}
