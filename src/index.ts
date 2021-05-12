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
  bird?: PIXI.AnimatedSprite;
}

/**
 * Constants.
 */

declare const VERSION: string;

const gameWidth = () => window.innerWidth;
const gameHeight = () => window.innerHeight;

/**
 * Main functions.
 */

startGame();

function startGame() {
  const stageState: StageState = {};

  // Create a PixiJS application.
  const app = createApp();

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
  if (stageState.bird) {
    stageState.bird.position.set(gameWidth() / 2, gameHeight() / 2);

    stageState.bird.rotation += 0.1;
  }

  renderer.render(stage);
}

/**
 * Helpers.
 */

function createApp() {
  return new PIXI.Application({
    backgroundColor: 0xd3d3d3,
    width: gameWidth(),
    height: gameHeight(),
    resolution: window.devicePixelRatio,
    autoDensity: true
  });
}

async function onResize(renderer: Renderer, stageState: StageState) {
  if (stageState.bird) {
    stageState.bird.position.set(gameWidth() / 2, gameHeight() / 2);
  }

  // TODO: Gracefully handle window resizes.
  // Keep list of all sprites
  // on window resize, compute distance needed to move to keep player centered (ducky)
  // move all sprites by that much

  renderer.resize(gameWidth(), gameHeight());
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
  const birdFromSprite = getBird();
  birdFromSprite.anchor.set(0.5, 0.5);
  birdFromSprite.position.set(gameWidth() / 2, gameHeight() / 2);

  stage.addChild(birdFromSprite);

  stageState.bird = birdFromSprite;
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
