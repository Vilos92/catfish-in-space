import * as PIXI from 'pixi.js';
import './style.css';

/**
 * Types.
 */

interface Callback {
  (): void;
}

type Renderer = PIXI.Renderer | PIXI.AbstractRenderer;

// TODO:
// First graduate this to having helper functions, to update value of bird and sprites (create class?)
// Eventually upgrade to redux.
interface StageState {
  bird: Bird;
  viewport: Viewport;
}

interface Bird {
  sprite?: PIXI.AnimatedSprite;
  coordinate: Coordinate;
}

interface Viewport {
  getDimension: () => Dimension;
  coordinate: Coordinate;
}

export interface Coordinate {
  x: number;
  y: number;
}

interface Dimension {
  width: number;
  height: number;
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
  const bird: Bird = {
    coordinate: {x: 0, y: 0}
  };

  // The coordinates of our Viewport begin negative, as our centered player
  // begins at (0, 0).
  const initialViewportCoordinate = viewportCoordinateFromBird(bird, {
    width: window.innerWidth,
    height: window.innerHeight
  });

  const viewport: Viewport = {
    // Viewport is maintained as the size of the window.
    getDimension: (): Dimension => ({
      width: window.innerWidth,
      height: window.innerHeight
    }),
    // Top-left corner of the current canvas.
    coordinate: initialViewportCoordinate
  };

  const stageState: StageState = {bird, viewport};

  // Create a PixiJS application.
  const app = createApp(stageState);

  const {renderer, stage, ticker, view} = app;

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(renderer, stageState);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> => onLoad(stage, view, stageState);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(renderer, stage, stageState);

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
function gameLoop(renderer: Renderer, stage: PIXI.Container, stageState: StageState) {
  if (stageState.bird && stageState.bird.sprite) {
    stageState.bird.sprite.rotation += 0.1;
  }

  renderer.render(stage);
}

/**
 * Helpers.
 */

function createApp(stageState: StageState) {
  return new PIXI.Application({
    backgroundColor: 0xd3d3d3,
    width: stageState.viewport.getDimension().width,
    height: stageState.viewport.getDimension().height,
    resolution: window.devicePixelRatio,
    autoDensity: true
  });
}

async function onResize(renderer: Renderer, stageState: StageState) {
  // We should re-arrange the viewport to be centered on our humble bird.
  stageState.viewport.coordinate = viewportCoordinateFromBird(stageState.bird, stageState.viewport.getDimension());

  if (stageState.bird.sprite) {
    const position = positionFromCoordinate(stageState.bird.coordinate, stageState.viewport);

    stageState.bird.sprite.position.set(position.x, position.y);
  }

  renderer.resize(stageState.viewport.getDimension().width, stageState.viewport.getDimension().height);
}

async function onLoad(stage: PIXI.Container, view: HTMLCanvasElement, stageState: StageState) {
  // Do not append the game view to the DOM, until the assets are loaded.
  await loadGameAssets();

  document.body.appendChild(view);

  setupStage(stage, stageState);
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
function setupStage(stage: PIXI.Container, stageState: StageState) {
  const birdPosition = positionFromCoordinate(stageState.bird.coordinate, stageState.viewport);

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
function positionFromCoordinate(coordinate: Coordinate, viewport: Viewport): Coordinate {
  return {
    x: coordinate.x - viewport.coordinate.x,
    y: coordinate.y - viewport.coordinate.y
  };
}

/**
 * Determine the current viewport position, which should always have the
 * bird centered when accounting for the canvas dimension.
 */
function viewportCoordinateFromBird(bird: Bird, dimension: Dimension): Coordinate {
  const x = bird.coordinate.x - dimension.width / 2;
  const y = bird.coordinate.y - dimension.height / 2;

  return {
    x,
    y
  };
}
