import * as PIXI from "pixi.js";
import "./style.css";

/**
 * Types.
 */

interface CallbackThreeParam<T1, T2, T3, T4 = void> {
    (param1: T1, param2: T2, param3: T3): T4;
}

type Renderer = PIXI.Renderer | PIXI.AbstractRenderer;

declare const VERSION: string;

const gameWidth = 800;
const gameHeight = 600;

startGame();

function startGame() {
    const app = createApp();

    const { stage, view, renderer } = app;

    setupWindowHooks(stage, view, renderer, onload);

    console.log(`Welcome to Catfish in Space v${VERSION}`);
}

function setupWindowHooks(
    stage: PIXI.Container,
    view: HTMLCanvasElement,
    renderer: Renderer,
    onload: CallbackThreeParam<PIXI.Container, HTMLCanvasElement, Renderer>
) {
    window.onload = async (): Promise<void> => {
        onload(stage, view, renderer);
    };
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

async function onload(stage: PIXI.Container, view: HTMLCanvasElement, renderer: Renderer) {
    await loadGameAssets();

    document.body.appendChild(view);

    resizeCanvas(renderer);

    const birdFromSprite = getBird();
    birdFromSprite.anchor.set(0.5, 0.5);
    birdFromSprite.position.set(gameWidth / 2, gameHeight / 2);

    stage.addChild(birdFromSprite);
}

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

function resizeCanvas(renderer: Renderer): void {
    const resize = () => {
        renderer.resize(gameWidth, gameHeight);

        // Currently a noop, but could redefine to scale to browser width/height.
        //app.renderer.resize(window.innerWidth, window.innerHeight);
        //app.stage.scale.x = window.innerWidth / gameWidth;
        //app.stage.scale.y = window.innerHeight / gameHeight;
    };

    resize();

    window.addEventListener("resize", resize);
}

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
