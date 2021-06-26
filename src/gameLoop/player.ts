import {Howl} from 'howler';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {getPhysicsElementByMatterId} from '../store/gameElement/selector';
import {Dispatch, GetState} from '../store/gameReducer';
import {getKeyboard} from '../store/keyboard/selector';
import {updateIsGameOverAction} from '../store/match/action';
import {getMouse} from '../store/mouse/selector';
import {
  clearPlayerGameElementAction,
  clearPlayerThrusterSoundAction,
  updatePlayerGameElementAction,
  updatePlayerPrimaryFireTimestampAction,
  updatePlayerThrusterSoundAction
} from '../store/player/action';
import {getPlayer} from '../store/player/selector';
import {getViewport} from '../store/viewport/selector';
import {Coordinate, Dimension, isPhysicsElement, MouseButtonCodesEnum, PhysicsElement, Renderer} from '../type';
import {createSound, setSoundCoordinate, setSoundSeekAtRandom, SoundTypesEnum} from '../utility/audio';
import {fireBufferPeriod, firePlayerLaserBullet, playLaserBulletSound} from '../utility/laserBullet';
import {
  addForceToPlayerMatterBodyFromKeyboard,
  addForceToPlayerMatterBodyFromMouseCoordinate
} from '../utility/playerMovement';

// Set forces on player matter from keyboard inputs, and update player coordinate
// to be aligned with the matter position.
export function playerLoop(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  renderer: Renderer,
  stage: PIXI.Container
): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const mouse = getMouse(state);
  const player = getPlayer(state);
  const viewport = getViewport(state);
  const physicsElementByMatterId = getPhysicsElementByMatterId(state);

  // If there is not currently a player Game Element, ensure audio is stopped and otherwise do nothing.
  if (!player.gameElement) {
    stopThrusterAudio(dispatch, player.thrusterSound);
    return;
  }

  const currentPlayerGameElement = player.gameElement;

  // Align our player Game Element with the Game Element state.
  const playerGameElement = physicsElementByMatterId.get(currentPlayerGameElement.matterBody.id);

  // If player has been destroyed in Game Elements state, we should clear it from Player state as well.
  if (!playerGameElement || !isPhysicsElement(playerGameElement)) {
    dispatch(clearPlayerGameElementAction());
    dispatch(updateIsGameOverAction(true));
    return;
  }

  const {matterBody: playerMatterBody} = playerGameElement;

  // Apply forces from keyboard presses, before updating state with values from matter.
  const forceAdded = addForceToPlayerMatterBodyFromKeyboard(keyboard, playerMatterBody);

  forceAdded
    ? handleThrusterAudio(dispatch, viewport.coordinate, viewport.dimension, player.gameElement, player.thrusterSound)
    : stopThrusterAudio(dispatch, player.thrusterSound);

  const mouseCoordinate: Coordinate = renderer.plugins.interaction.mouse.global;

  addForceToPlayerMatterBodyFromMouseCoordinate(
    dispatch,
    mouseCoordinate,
    viewport.coordinate,
    playerMatterBody,
    player.pidState
  );

  // We must update the player GameElement here to account for the coordinate
  // and rotation needed by the viewport. The sprite loop is responsible for
  // other operations regarding presentation.
  const coordinate: Coordinate = playerMatterBody.position;
  const rotation = playerMatterBody.angle % (2 * Math.PI);

  const updatedPlayerGameElement: PhysicsElement = {...playerGameElement, coordinate, rotation};
  dispatch(updatePlayerGameElementAction(updatedPlayerGameElement));

  // Lasers go pew.
  if (mouse.buttonStateMap[MouseButtonCodesEnum.MOUSE_BUTTON_PRIMARY].isActive) {
    handleFireLaserBullet(
      dispatch,
      world,
      stage,
      viewport.coordinate,
      viewport.dimension,
      player.gameElement,
      player.primaryFireTimestamp
    );
  }
}

/**
 * Determine whether the player can fire a laser bullet given their last fired timestamp,
 * and also handle playing the corresponding audio.
 */
function handleFireLaserBullet(
  dispatch: Dispatch,
  world: Matter.World,
  stage: PIXI.Container,
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension,
  playerGameElement: PhysicsElement,
  primaryFireTimestamp: number
) {
  const now = Date.now();

  if (now > primaryFireTimestamp + fireBufferPeriod) {
    const laserBullet = firePlayerLaserBullet(
      dispatch,
      world,
      stage,
      viewportCoordinate,
      playerGameElement.pixiSprite,
      playerGameElement.matterBody
    );

    playLaserBulletSound(laserBullet.coordinate, viewportCoordinate, viewportDimension);

    dispatch(updatePlayerPrimaryFireTimestampAction(now));
  }
}

/**
 * Handle the playing and stopping of audio for the player's thruster.
 */
function handleThrusterAudio(
  dispatch: Dispatch,
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension,
  playerGameElement: PhysicsElement,
  thrusterSound?: Howl
) {
  const {coordinate: playerCoordinate} = playerGameElement;

  if (!thrusterSound) {
    thrusterSound = createThrusterSound();
    thrusterSound.play();

    dispatch(updatePlayerThrusterSoundAction(thrusterSound));
  }

  setSoundCoordinate(thrusterSound, playerCoordinate, viewportCoordinate, viewportDimension);
}

/**
 * Stop the audio for the player's thruster.
 */
function stopThrusterAudio(dispatch: Dispatch, thrusterSound?: Howl): void {
  thrusterSound?.stop();
  dispatch(clearPlayerThrusterSoundAction());
}

/**
 * Create a looping thruster sound with reduced volumea
 */
function createThrusterSound(): Howl {
  const thrusterSound = createSound(SoundTypesEnum.ROCKET_THRUST, {
    volume: 0.5,
    loop: true
  });
  return setSoundSeekAtRandom(thrusterSound);
}
