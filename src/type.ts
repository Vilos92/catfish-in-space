import * as PIXI from 'pixi.js';

export interface Callback {
  (): void;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface GameSprite {
  // This is the coordinate in our game, not the canvas.
  coordinate: Coordinate;
  sprite?: PIXI.AnimatedSprite;
}
