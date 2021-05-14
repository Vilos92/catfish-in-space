import * as PIXI from 'pixi.js';

import {Coordinate} from '../../type';

export enum ActionTypesEnum {
  UPDATE_PLAYER_COORDINATE_ACTION = 'update_player_coordinate_action',
  UPDATE_PLAYER_SPRITE_ACTION = 'update_player_sprite_action'
}

export interface UpdatePlayerCoordinateAction {
  type: ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION;
  coordinate: Coordinate;
}

export interface UpdatePlayerSpriteAction {
  type: ActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION;
  sprite: PIXI.AnimatedSprite;
}

export type PlayerAction = UpdatePlayerCoordinateAction | UpdatePlayerSpriteAction;

export function updatePlayerCoordinateAction(coordinate: Coordinate): UpdatePlayerCoordinateAction {
  return {
    type: ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION,
    coordinate
  };
}

export function updatePlayerSpriteAction(sprite: PIXI.AnimatedSprite): UpdatePlayerSpriteAction {
  return {
    type: ActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION,
    sprite
  };
}
