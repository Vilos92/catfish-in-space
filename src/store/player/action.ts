import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {Coordinate} from '../../type';

export enum PlayerActionTypesEnum {
  UPDATE_PLAYER_COORDINATE_ACTION = 'UPDATE_PLAYER_COORDINATE_ACTION',
  UPDATE_PLAYER_ROTATION_ACTION = 'UPDATE_PLAYER_ROTATION_ACTION',
  UPDATE_PLAYER_MATTER_BODY_ACTION = 'UPDATE_PLAYER_MATTER_BODY_ACTION',
  UPDATE_PLAYER_SPRITE_ACTION = 'UPDATE_PLAYER_SPRITE_ACTION'
}

export interface UpdatePlayerCoordinateAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION;
  coordinate: Coordinate;
}

export interface UpdatePlayerRotationAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_ROTATION_ACTION;
  rotation: number;
}

export interface UpdatePlayerMatterBodyAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_MATTER_BODY_ACTION;
  matterBody: Matter.Body;
}

export interface UpdatePlayerSpriteAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION;
  pixiSprite: PIXI.Sprite;
}

export type PlayerAction =
  | UpdatePlayerCoordinateAction
  | UpdatePlayerRotationAction
  | UpdatePlayerMatterBodyAction
  | UpdatePlayerSpriteAction;

export function updatePlayerCoordinateAction(coordinate: Coordinate): UpdatePlayerCoordinateAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION,
    coordinate
  };
}

export function updatePlayerRotationAction(rotation: number): UpdatePlayerRotationAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_ROTATION_ACTION,
    rotation
  };
}

export function updatePlayerMatterBodyAction(matterBody: Matter.Body): UpdatePlayerMatterBodyAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_MATTER_BODY_ACTION,
    matterBody
  };
}

export function updatePlayerSpriteAction(pixiSprite: PIXI.Sprite): UpdatePlayerSpriteAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION,
    pixiSprite
  };
}
