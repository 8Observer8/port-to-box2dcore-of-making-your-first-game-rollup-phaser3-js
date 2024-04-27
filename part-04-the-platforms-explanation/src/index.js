import { b2BodyType } from '@box2d/core';
import { b2PolygonShape } from '@box2d/core';
import { b2World } from '@box2d/core';
import { DrawShapes } from '@box2d/core';
import { WEBGL, Game, Scale } from 'phaser3';
import DebugDrawer from './debug-drawer.js';

const config = {
    type: WEBGL,

    canvas: document.getElementById('renderCanvas'),
    width: 800,
    height: 600,
    scaleMode: Scale.ScaleModes.FIT,
    autoCenter: Scale.Center.CENTER_BOTH,

    autoFocus: true,
    scene: { preload, create, update },
    backgroundColor: '#555',

    callbacks: {
        preBoot: (game) => {
            game.scale.on('resize', onResize, game);
        }
    }
};

const debugInfoCheckBox = document.getElementById('debugInfoCheckBox');
let showDebugInfo = debugInfoCheckBox.checked;
debugInfoCheckBox.onchange = () => {
    showDebugInfo = debugInfoCheckBox.checked;
};

const debugInfoPanel = document.getElementById('debugInfoPanel');
const game = new Game(config);

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {
        frameWidth: 32,
        frameHeight: 48
    });
}

function onResize() {
    const { right, top } = this.scale.canvasBounds;

    debugInfoPanel.style.top = `${top + 10}px`;
    debugInfoPanel.style.left = `${right - debugInfoPanel.clientWidth - 20}px`;
    debugInfoPanel.style.display = 'block';
}

function create() {
    this.world = b2World.Create({ x: 0, y: 10 });
    this.pixelsPerMeter = 50;

    this.add.image(400, 300, 'sky');

    // Walls
    const walls = [];
    walls[0] = {
        x: 0,
        y: 300,
        w: 10,
        h: 600,
        xOffset: -5,
        yOffset: 0
    };
    walls[1] = {
        x: 800,
        y: 300,
        w: 10,
        h: 600,
        xOffset: 5,
        yOffset: 0
    };
    walls[2] = {
        x: 400,
        y: 0,
        w: 800,
        h: 10,
        xOffset: 0,
        yOffset: -5
    };
    for (let i = 0; i < walls.length; i++) {
        const shape = new b2PolygonShape();
        shape.SetAsBox(
            walls[i].w / 2 / this.pixelsPerMeter,
            walls[i].h / 2 / this.pixelsPerMeter);
        const body = this.world.CreateBody({
            type: b2BodyType.b2_staticBody,
            position: {
                x: (walls[i].x + walls[i].xOffset) / this.pixelsPerMeter,
                y: (walls[i].y + walls[i].yOffset) / this.pixelsPerMeter
            }
        });
        const fixture = body.CreateFixture({ shape: shape });
        fixture.SetFriction(0);
    }

    // Platforms
    const platforms = [];
    platforms[0] = this.add.image(400, 568, 'ground').setScale(2);
    platforms[1] = this.add.image(600, 400, 'ground');
    platforms[2] = this.add.image(50, 250, 'ground');
    platforms[3] = this.add.image(750, 220, 'ground');
    for (let i = 0; i < platforms.length; i++) {
        const shape = new b2PolygonShape();
        shape.SetAsBox(
            platforms[i].displayWidth / 2 / this.pixelsPerMeter,
            platforms[i].displayHeight / 2 / this.pixelsPerMeter);
        const body = this.world.CreateBody({
            type: b2BodyType.b2_staticBody,
            position: {
                x: platforms[i].x / this.pixelsPerMeter,
                y: platforms[i].y / this.pixelsPerMeter
            }
        });
        const fixture = body.CreateFixture({ shape: shape });
        fixture.SetFriction(3);
    }

    this.graphics = this.add.graphics();
    this.debugDrawer = new DebugDrawer(this.graphics, this.pixelsPerMeter);
}

function update() {
    if (!this.world) {
        return;
    }

    this.world.Step(0.016, { velocityIterations: 3, positionIterations: 2 });

    if (showDebugInfo) {
        DrawShapes(this.debugDrawer, this.world);
    }

    if (showDebugInfo) {
        this.debugDrawer.clear();
    }
}
