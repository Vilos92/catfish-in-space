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
  updatePlayerThrusterSoundAction
} from '../store/player/action';
import {getPlayer} from '../store/player/selector';
import {getViewport} from '../store/viewport/selector';
import {Coordinate, Dimension, isPhysicsElement, MouseButtonCodesEnum, PhysicsElement, Renderer} from '../type';
import {createSound, soundAtCoordinate, soundAtRandom, SoundTypesEnum} from '../utility/audio';
import {firePlayerLaserBullet} from '../utility/laserBullet';
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

  if (!player.gameElement) return;
  const currentPlayerGameElement = player.gameElement;

  // Align our player Physics Element with the Game Elements state.
  const playerGameElement = physicsElementByMatterId.get(currentPlayerGameElement.matterBody.id);

  if (!playerGameElement || !isPhysicsElement(playerGameElement)) {
    dispatch(clearPlayerGameElementAction());
    dispatch(updateIsGameOverAction(true));
    return;
  }

  const {matterBody: playerMatterBody} = playerGameElement;

  // Apply forces from keyboard presses, before updating state with values from matter.
  const forceAdded = addForceToPlayerMatterBodyFromKeyboard(keyboard, playerMatterBody);

  handleForceSound(
    dispatch,
    viewport.coordinate,
    viewport.dimension,
    player.gameElement.coordinate,
    forceAdded,
    player.thrusterSound
  );

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
  if (mouse.buttonStateMap[MouseButtonCodesEnum.MOUSE_BUTTON_PRIMARY].isActive)
    firePlayerLaserBullet(
      dispatch,
      world,
      stage,
      viewport.coordinate,
      player.primaryFireTimestamp,
      player.gameElement.pixiSprite,
      player.gameElement.matterBody
    );
}

function handleForceSound(
  dispatch: Dispatch,
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension,
  playerCoordinate: Coordinate,
  forceAdded: boolean,
  thrusterSound?: Howl
) {
  if (!forceAdded) {
    thrusterSound?.stop();
    dispatch(clearPlayerThrusterSoundAction());
    return;
  }

  if (!thrusterSound) {
    thrusterSound = createSound(SoundTypesEnum.ROCKET_THRUST, {
      volume: 0.5,
      loop: true
    });
    thrusterSound = soundAtRandom(thrusterSound);
    thrusterSound.play();

    dispatch(updatePlayerThrusterSoundAction(thrusterSound));
  }

  soundAtCoordinate(thrusterSound, playerCoordinate, viewportCoordinate, viewportDimension);
}
