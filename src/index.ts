import './style.css';

import {startGame} from './game';

/**
 * Constants.
 */

declare const VERSION: string;

// Go!
startGame();

console.log(`Welcome to Catfish in Space v${VERSION}`);
