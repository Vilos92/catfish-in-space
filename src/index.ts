import * as PIXI from 'pixi.js';
import './style.css';
import {Coordinate, Dimension} from './type';
import {State, store} from './state/store';
import {updateCoordinateAction} from './state/viewport/action';
import {getViewportCoordinate, getViewportDimension} from './state/viewport/selector';

/**
 * Types.
 */

interface Callback {
  (): void;
}

type Renderer = PIXI.Renderer | PIXI.AbstractRenderer;

interface StageState {
  bird: GameObject;
}

interface GameObject {
  sprite?: PIXI.AnimatedSprite;
  coordinate: Coordinate;
}

/**
 * Constants.
 */

declare const VERSION: string;

/**
 * Main functions.
 */

startGame();

function startGame() {
  // Initialize the game state.
  const bird: GameObject = {
    coordinate: {x: 0, y: 0}
  };

  // The coordinates of our Viewport begin negative, as our centered player
  // begins at (0, 0).
  const initialViewportCoordinate = viewportCoordinateFromBird(bird, {
    width: window.innerWidth,
    height: window.innerHeight
  });

  store.dispatch(updateCoordinateAction(initialViewportCoordinate));
  const stageState: StageState = {bird};

  const state = store.getState();

  // Create a PixiJS application.
  const app = createApp();

  const {renderer, stage, ticker, view} = app;

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(renderer, stageState, state);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> => onLoad(stage, view, stageState, state);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(renderer, stage, stageState, state);

  // Attach and start game loop.
  ticker.add(onGameLoop);
  ticker.start();

  console.log(`Welcome to Catfish in Space v${VERSION}`);
}

function setupWindowHooks(onload: Callback, resize: Callback) {
  window.onload = onload;
  window.addEventListener('resize', resize);
}

/**
 * Primary game loop function, which is responsible for
 * making changes to the current stage.
 */
function gameLoop(renderer: Renderer, stage: PIXI.Container, stageState: StageState, state: State) {
  const {bird} = stageState;

  if (stageState.bird && stageState.bird.sprite) {
    stageState.bird.sprite.rotation += 0.1;
  }

  const birdPosition = positionFromViewportCoordinate(bird.coordinate, getViewportCoordinate(state.viewport));

  if (bird.sprite) {
    bird.sprite.position.set(birdPosition.x, birdPosition.y);
  }

  const coordinate: Coordinate = {
    x: state.viewport.coordinate.x + 1,
    y: state.viewport.coordinate.y + 1
  };

  store.dispatch(updateCoordinateAction(coordinate));

  renderer.render(stage);
}

/**
 * Helpers.
 */

function createApp() {
  const {width, height} = getViewportDimension();

  return new PIXI.Application({
    backgroundColor: 0xd3d3d3,
    width,
    height,
    resolution: window.devicePixelRatio,
    autoDensity: true
  });
}

async function onResize(renderer: Renderer, stageState: StageState, state: State) {
  const viewportDimension = getViewportDimension();

  // We should re-arrange the viewport to be centered on our humble bird.
  const viewportCoordinate = viewportCoordinateFromBird(stageState.bird, viewportDimension);
  store.dispatch(updateCoordinateAction(viewportCoordinate));

  if (stageState.bird.sprite) {
    const position = positionFromViewportCoordinate(stageState.bird.coordinate, getViewportCoordinate(state.viewport));

    stageState.bird.sprite.position.set(position.x, position.y);
  }

  renderer.resize(viewportDimension.width, viewportDimension.height);
}

async function onLoad(stage: PIXI.Container, view: HTMLCanvasElement, stageState: StageState, state: State) {
  // Do not append the game view to the DOM, until the assets are loaded.
  await loadGameAssets();

  document.body.appendChild(view);

  setupStage(stage, stageState, state);
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
function setupStage(stage: PIXI.Container, stageState: StageState, state: State) {
  const birdPosition = positionFromViewportCoordinate(
    stageState.bird.coordinate,
    getViewportCoordinate(state.viewport)
  );

  const birdFromSprite = getBird();
  birdFromSprite.anchor.set(0.5, 0.5);

  birdFromSprite.position.set(birdPosition.x, birdPosition.y);

  stage.addChild(birdFromSprite);

  stageState.bird.sprite = birdFromSprite;
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

/**
 * Determine the position in the canvas by computing a sprite's position relative to the viewport.
 */
function positionFromViewportCoordinate(coordinate: Coordinate, viewportCoordinate: Coordinate): Coordinate {
  return {
    x: coordinate.x - viewportCoordinate.x,
    y: coordinate.y - viewportCoordinate.y
  };
}

/**
 * Determine the current viewport position, which should always have the
 * bird centered when accounting for the canvas dimension.
 */
function viewportCoordinateFromBird(bird: GameObject, dimension: Dimension): Coordinate {
  const x = bird.coordinate.x - dimension.width / 2;
  const y = bird.coordinate.y - dimension.height / 2;

  return {
    x,
    y
  };
}
