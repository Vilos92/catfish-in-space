import * as PIXI from 'pixi.js';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';
import {State} from './state/store';
import {getViewportCoordinate, getViewportDimension} from './state/viewport/selector';
import {Renderer, StageState} from './index';
import {Callback, CallbackWithArg, Coordinate} from './type';

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
  stageState: StageState,
  state: State,
  updateCoordinate: CallbackWithArg<Coordinate>
): Promise<void> {
  const viewportDimension = getViewportDimension();

  // We should re-arrange the viewport to be centered on our humble bird.
  const viewportCoordinate = calculateViewportCoordinate(stageState.bird, viewportDimension);
  updateCoordinate(viewportCoordinate);

  if (stageState.bird.sprite) {
    const position = calculatePositionRelativeToViewport(
      stageState.bird.coordinate,
      getViewportCoordinate(state.viewport)
    );

    stageState.bird.sprite.position.set(position.x, position.y);
  }

  renderer.resize(viewportDimension.width, viewportDimension.height);
}

export async function onLoad(
  stage: PIXI.Container,
  view: HTMLCanvasElement,
  stageState: StageState,
  state: State
): Promise<void> {
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
  const birdPosition = calculatePositionRelativeToViewport(
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
