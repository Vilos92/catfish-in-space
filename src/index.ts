import * as PIXI from "pixi.js";
import "./style.css";

/**
 * Types.
 */

interface Callback {
  (): void;
}

type Renderer = PIXI.Renderer | PIXI.AbstractRenderer;

declare const VERSION: string;

const gameWidth = 800;
const gameHeight = 600;

startGame();

function startGame() {
  const app = createApp();

  const { stage, view, renderer } = app;

  const resize = async (): Promise<void> => onResize(renderer);
  resize();

  const onload = async (): Promise<void> => onLoadGame(stage, view);

  setupWindowHooks(onload, resize);

  console.log(`Welcome to Catfish in Space v${VERSION}`);
}

function setupWindowHooks(onload: Callback, resize: Callback) {
  window.onload = onload;
  window.addEventListener("resize", resize);
}

/**
 * Helpers.
 */

function createApp() {
  return new PIXI.Application({
    backgroundColor: 0xd3d3d3,
    width: gameWidth,
    height: gameHeight,
  });
}

async function onResize(renderer: Renderer) {
  renderer.resize(gameWidth, gameHeight);

  // Currently a noop, but could redefine to scale to browser width/height.
  //app.renderer.resize(window.innerWidth, window.innerHeight);
  //app.stage.scale.x = window.innerWidth / gameWidth;
  //app.stage.scale.y = window.innerHeight / gameHeight;
}

async function onLoadGame(stage: PIXI.Container, view: HTMLCanvasElement) {
  // Do not append the game view to the DOM, until the assets are loaded.
  await loadGameAssets();

  document.body.appendChild(view);

  setupStage(stage);
}

/**
 * Load game assets as a side-effect (no return value).
 * Currently these assets are just a sprite sheet.
 */
async function loadGameAssets(): Promise<void> {
  return new Promise((res, rej) => {
    const loader = PIXI.Loader.shared;
    loader.add("rabbit", "./assets/simpleSpriteSheet.json");

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
function setupStage(stage: PIXI.Container): void {
  const birdFromSprite = getBird();
  birdFromSprite.anchor.set(0.5, 0.5);
  birdFromSprite.position.set(gameWidth / 2, gameHeight / 2);

  stage.addChild(birdFromSprite);
}

/**
 * Test method which loads a bird from the sprite sheet, and returns the AnimatedSprite.
 */
function getBird(): PIXI.AnimatedSprite {
  const bird = new PIXI.AnimatedSprite([
    PIXI.Texture.from("birdUp.png"),
    PIXI.Texture.from("birdMiddle.png"),
    PIXI.Texture.from("birdDown.png"),
  ]);

  bird.loop = true;
  bird.animationSpeed = 0.1;
  bird.play();
  bird.scale.set(3);

  return bird;
}
