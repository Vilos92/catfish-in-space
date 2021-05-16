import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {Coordinate} from '../../type';

export enum ActionTypesEnum {
  UPDATE_PLAYER_COORDINATE_ACTION = 'update_player_coordinate_action',
  UPDATE_PLAYER_MATTER_BODY_ACTION = 'update_player_matter_body_action',
  UPDATE_PLAYER_SPRITE_ACTION = 'update_player_sprite_action'
}

export interface UpdatePlayerCoordinateAction {
  type: ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION;
  coordinate: Coordinate;
}

export interface UpdatePlayerMatterBodyAction {
  type: ActionTypesEnum.UPDATE_PLAYER_MATTER_BODY_ACTION;
  matterBody: Matter.Body;
}

export interface UpdatePlayerSpriteAction {
  type: ActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION;
  sprite: PIXI.AnimatedSprite;
}

export type PlayerAction = UpdatePlayerCoordinateAction | UpdatePlayerMatterBodyAction | UpdatePlayerSpriteAction;

export function updatePlayerCoordinateAction(coordinate: Coordinate): UpdatePlayerCoordinateAction {
  return {
    type: ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION,
    coordinate
  };
}

export function updatePlayerMatterBodyAction(matterBody: Matter.Body): UpdatePlayerMatterBodyAction {
  return {
    type: ActionTypesEnum.UPDATE_PLAYER_MATTER_BODY_ACTION,
    matterBody
  };
}

export function updatePlayerSpriteAction(sprite: PIXI.AnimatedSprite): UpdatePlayerSpriteAction {
  return {
    type: ActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION,
    sprite
  };
}
