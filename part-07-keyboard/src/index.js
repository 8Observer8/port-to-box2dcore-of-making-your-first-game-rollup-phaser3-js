import { b2BodyType } from '@box2d/core';
import { b2CircleShape } from '@box2d/core';
import { b2PolygonShape } from '@box2d/core';
import { b2World } from '@box2d/core';
import { b2Vec2 } from '@box2d/core';
import { DrawShapes } from '@box2d/core';
import { Display, WEBGL, Game, Scale } from 'phaser3';
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

let playerBody;

const input = {
    p1: null,
    p2: null,
    maxFraction: 1
};
const output = {
    normal: new b2Vec2(0, 0),
    fraction: 1
};

let fixtureIsFound = false;
let groundedLeft = false;
let groundedRight = false;
const fixtures = [];

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

    this.cursors = this.input.keyboard.createCursorKeys();
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
        fixtures.push(fixture);
    }

    this.player = this.add.sprite(100, 450, 'dude');

    const playerShape = new b2CircleShape(20 / this.pixelsPerMeter);
    playerBody = this.world.CreateBody({
        type: b2BodyType.b2_dynamicBody,
        position: {
            x: this.player.x / this.pixelsPerMeter,
            y: this.player.y / this.pixelsPerMeter
        }
    });
    playerBody.SetFixedRotation(true);
    const playerFixture = playerBody.CreateFixture({
        shape: playerShape,
        density: 1
    });
    playerFixture.SetFriction(3);
    playerFixture.SetUserData({ name: 'player' });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }]
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.graphics = this.add.graphics();
    this.debugDrawer = new DebugDrawer(this.graphics, this.pixelsPerMeter);
}

function update() {
    if (!this.world) {
        return;
    }

    if (this.cursors.left.isDown) {
        const vel = playerBody.GetLinearVelocity();
        vel.x = -3;
        playerBody.SetLinearVelocity(vel);
        this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
        const vel = playerBody.GetLinearVelocity();
        vel.x = 3;
        playerBody.SetLinearVelocity(vel);
        this.player.anims.play('right', true);
    } else {
        this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && (groundedLeft || groundedRight)) {
        const vel = playerBody.GetLinearVelocity();
        vel.y = -9;
        playerBody.SetLinearVelocity(vel);
    }

    this.world.Step(0.016, { velocityIterations: 3, positionIterations: 2 });

    const playerBodyPosition = playerBody.GetPosition();
    this.player.x = playerBodyPosition.x * this.pixelsPerMeter;
    this.player.y = playerBodyPosition.y * this.pixelsPerMeter - 3;

    if (showDebugInfo) {
        DrawShapes(this.debugDrawer, this.world);

        const c = new Display.Color().setGLTo(1, 0, 0, 1);
        this.graphics.lineStyle(3, c.color, 1.0);
        this.graphics.beginPath();
        // Left ray
        this.graphics.moveTo(playerBodyPosition.x * this.pixelsPerMeter - 12,
            playerBodyPosition.y * this.pixelsPerMeter + 5);
        this.graphics.lineTo(playerBodyPosition.x * this.pixelsPerMeter - 12,
            playerBodyPosition.y * this.pixelsPerMeter + 25);
        // Right ray
        this.graphics.moveTo(playerBodyPosition.x * this.pixelsPerMeter + 12,
            playerBodyPosition.y * this.pixelsPerMeter + 5);
        this.graphics.lineTo(playerBodyPosition.x * this.pixelsPerMeter + 12,
            playerBodyPosition.y * this.pixelsPerMeter + 25);
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    // Left ray
    let point1 = new b2Vec2(playerBodyPosition.x - (12 / this.pixelsPerMeter),
        playerBodyPosition.y + (5 / this.pixelsPerMeter));
    let point2 = new b2Vec2(playerBodyPosition.x - (12 / this.pixelsPerMeter),
        playerBodyPosition.y + (25 / this.pixelsPerMeter));
    input.p1 = point1;
    input.p2 = point2;
    groundedLeft = false;
    for (let i = 0; i < fixtures.length; i++) {
        groundedLeft = fixtures[i].RayCast(output, input);
        if (groundedLeft)
            break;
    }

    // Right ray
    point1 = new b2Vec2(playerBodyPosition.x + (12 / this.pixelsPerMeter),
        playerBodyPosition.y + (5 / this.pixelsPerMeter));
    point2 = new b2Vec2(playerBodyPosition.x + (12 / this.pixelsPerMeter),
        playerBodyPosition.y + (25 / this.pixelsPerMeter));
    input.p1 = point1;
    input.p2 = point2;
    groundedRight = false;
    for (let i = 0; i < fixtures.length; i++) {
        groundedRight = fixtures[i].RayCast(output, input);
        if (groundedRight)
            break;
    }

    if (showDebugInfo) {
        this.debugDrawer.clear();
    }
}
