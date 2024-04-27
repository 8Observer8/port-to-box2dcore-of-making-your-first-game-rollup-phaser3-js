import { b2ContactListener, b2BodyType, b2CircleShape, b2Vec2, b2WorldManifold, b2World, b2PolygonShape, DrawShapes } from '@box2d/core';
import { Display, Math as Math$1, WEBGL, Scale, Game } from 'phaser3';

const entityCategory = {
    TOP_WALL: 0x0001,
    REST_WALLS: 0x0002,
    PLAYER: 0x0004,
    PLATFORMS: 0x0008,
    STARS: 0x0010,
    INACTIVE_STARS: 0x0020,
    BOMBS: 0x0040
};

class DebugDrawer {

    constructor(graphics, pixelsPerMeter) {
        this.graphics = graphics;
        this.pixelsPerMeter = pixelsPerMeter;
        this.lineWidth = 3;
    }

    clear() {
        setTimeout(() => this.graphics.clear(), 0);
    }

    DrawSolidPolygon(vertices, vertexCount, color) {
        const c = new Display.Color().setGLTo(color.r, color.g, color.b, 1);
        this.graphics.lineStyle(this.lineWidth, c.color, 1.0);
        this.graphics.beginPath();
        this.graphics.moveTo(vertices[0].x * this.pixelsPerMeter, vertices[0].y * this.pixelsPerMeter);
        this.graphics.lineTo(vertices[1].x * this.pixelsPerMeter, vertices[1].y * this.pixelsPerMeter);
        this.graphics.lineTo(vertices[2].x * this.pixelsPerMeter, vertices[2].y * this.pixelsPerMeter);
        this.graphics.lineTo(vertices[3].x * this.pixelsPerMeter, vertices[3].y * this.pixelsPerMeter);
        this.graphics.lineTo(vertices[0].x * this.pixelsPerMeter, vertices[0].y * this.pixelsPerMeter);
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    PushTransform(xf) {
        this.graphics.save();
        this.graphics.translateCanvas(xf.p.x * this.pixelsPerMeter,
            xf.p.y * this.pixelsPerMeter);
        this.graphics.rotateCanvas(xf.q.GetAngle());
    }

    PopTransform(xf) {
        this.graphics.restore();
    }

    DrawPolygon(vertices, vertexCount, color) {}
    DrawCircle(center, radius, color) {}

    DrawSolidCircle(center, radius, axis, color) {
        let angle = 0;
        const angleStep = 20;
        const n = 360 / angleStep;
        radius = radius * this.pixelsPerMeter;

        const c = new Display.Color().setGLTo(color.r, color.g, color.b, 1);
        this.graphics.lineStyle(3, c.color, 1.0);
        this.graphics.beginPath();
        this.graphics.strokeStyle = `rgb(${color.r * 255},` +
            `${color.g * 255},` + `${color.b * 255})`;

        let x = radius * Math.cos(angle * Math.PI / 180);
        let y = radius * Math.sin(angle * Math.PI / 180);
        this.graphics.moveTo(x, y);
        angle += angleStep;

        for (let i = 0; i < n; i++) {
            x = radius * Math.cos(angle * Math.PI / 180);
            y = radius * Math.sin(angle * Math.PI / 180);
            this.graphics.lineTo(x, y);
            angle += angleStep;
        }
        this.graphics.stroke();
    }

    DrawSegment(p1, p2, color) {}
    DrawTransform(xf) {}
    DrawPoint(p, size, color) {}
}

class ContactListener extends b2ContactListener {

    constructor(scoreText, initialNumberOfStars, starFixtures,
        bombFixtures, player, scene, pixelsPerMeter, world) //
    {
        super();
        this.scoreText = scoreText;
        this.score = 0;
        this.initialNumberOfStars = initialNumberOfStars;
        this.starFixtures = starFixtures;
        this.collectedNumberOfStars = 0;
        this.bombFixtures = bombFixtures;
        this.player = player;
        this.scene = scene;
        this.pixelsPerMeter = pixelsPerMeter;
        this.world = world;
        this.paused = false;
    }

    BeginContact(contact) {
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();

        const userDataA = fixtureA.GetUserData();
        const userDataB = fixtureB.GetUserData();

        if (!userDataA || !userDataB) {
            return;
        }

        const nameA = userDataA.name;
        const nameB = userDataB.name;

        if ((nameA == 'player' && nameB == 'star') ||
            (nameA == 'star' && nameB == 'player')) //
        {
            let starBody, starFixture, starUserData;

            if (nameA == 'player' && nameB == 'star') {
                starFixture = fixtureB;
                starBody = fixtureB.GetBody();
                starUserData = userDataB;
            } else if (nameA == 'star' && nameB == 'player') {
                starFixture = fixtureA;
                starBody = fixtureA.GetBody();
                starUserData = userDataA;
            }

            starUserData.star.visible = false;

            setTimeout(() => {
                starFixture.SetSensor(true);
                starBody.SetType(b2BodyType.b2_staticBody);
                starBody.SetTransformXY(starUserData.startPosX, starUserData.startPosY, 0);
                starFixture.m_filter.categoryBits = entityCategory.INACTIVE_STARS;

                this.score += 10;
                this.scoreText.setText(`Score: ${this.score}`);
                this.collectedNumberOfStars++;

                if (this.collectedNumberOfStars == this.initialNumberOfStars) {
                    this.collectedNumberOfStars = 0;
                    for (let i = 0; i < this.starFixtures.length; i++) {
                        this.starFixtures[i].SetSensor(false);
                        this.starFixtures[i].GetBody().SetType(b2BodyType.b2_dynamicBody);
                        this.starFixtures[i].m_filter.categoryBits = entityCategory.STARS;
                        const starUserData = this.starFixtures[i].GetUserData();
                        starUserData.star.visible = true;
                    }

                    const x = (this.player.x < 400) ? Math$1.Between(400, 800) : Math$1.Between(0, 400);
                    const bomb = this.scene.add.sprite(x, 20, 'bomb');
                    const bombShape = new b2CircleShape(7 / this.pixelsPerMeter);
                    const bombPosX = bomb.x / this.pixelsPerMeter;
                    const bombPosY = bomb.y / this.pixelsPerMeter;
                    const bombBody = this.world.CreateBody({
                        type: b2BodyType.b2_dynamicBody,
                        position: {
                            x: bombPosX,
                            y: bombPosY
                        }
                    });
                    bombBody.SetFixedRotation(true);
                    // bombBody.SetGravityScale(0);
                    bombBody.SetLinearVelocity(new b2Vec2(Math$1.Between(-3, 3), 2));
                    const bombFixture = bombBody.CreateFixture({
                        shape: bombShape,
                        density: 1,
                        friction: 0,
                        restitution: 1
                    });
                    bombFixture.SetUserData({
                        name: 'bomb',
                        bomb: bomb
                    });
                    bombFixture.m_filter.categoryBits = entityCategory.BOMBS;
                    bombFixture.m_filter.maskBits = entityCategory.PLATFORMS |
                        entityCategory.TOP_WALL | entityCategory.REST_WALLS |
                        entityCategory.PLAYER;
                    this.bombFixtures.push(bombFixture);
                }
            }, 0);
        }

        if ((nameA == 'bomb' && nameB == 'platform') ||
            (nameA == 'platform' && nameB == 'bomb') ||
            (nameA == 'bomb' && nameB == 'wall') ||
            (nameA == 'wall' && nameB == 'bomb')) //
        {
            let bombBody;
            if (nameA == 'bomb') {
                bombBody = fixtureA.GetBody();
            } else {
                bombBody = fixtureB.GetBody();
            }
            const vel = bombBody.GetLinearVelocity();
            const m = new b2WorldManifold();
            contact.GetWorldManifold(m);
            const x = window.Math.round(m.normal.x);
            const y = window.Math.round(m.normal.y);
            if ((x == 1 && y == 0) || x == -1 && y == 0) {
                vel.x = -vel.x;
                bombBody.SetLinearVelocity(vel);
            } else if ((x == 0 && y == 1) || (x == 0 && y == -1)) {
                vel.y = -vel.y;
                bombBody.SetLinearVelocity(vel);
            }
        }

        if ((nameA == 'player' && nameB == 'bomb') ||
            (nameA == 'bomb' && nameB == 'player')) //
        {
            this.player.setTint(0xff0000);
            this.player.anims.play('turn');
            this.paused = true;
        }
    }

    isPaused() {
        return this.paused;
    }
}

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
const stars = [];
const starBodies = [];
const starFixtures = [];
const bombFixtures = [];

let contactListener;

const input = {
    p1: null,
    p2: null,
    maxFraction: 1
};
const output = {
    normal: new b2Vec2(0, 0),
    fraction: 1
};
let groundedLeft = false;
let groundedRight = false;
const fixtures = [];

const debugInfoCheckBox = document.getElementById('debugInfoCheckBox');
let showDebugInfo = debugInfoCheckBox.checked;
debugInfoCheckBox.onchange = () => {
    showDebugInfo = debugInfoCheckBox.checked;
};

const debugInfoPanel = document.getElementById('debugInfoPanel');
new Game(config);

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
        yOffset: 0,
        category: entityCategory.REST_WALLS
    };
    walls[1] = {
        x: 800,
        y: 300,
        w: 10,
        h: 600,
        xOffset: 5,
        yOffset: 0,
        category: entityCategory.REST_WALLS
    };
    walls[2] = {
        x: 400,
        y: 0,
        w: 800,
        h: 10,
        xOffset: 0,
        yOffset: -5,
        category: entityCategory.TOP_WALL
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
        fixture.SetUserData({ name: 'wall' });
        fixture.SetFriction(0);
        fixture.m_filter.categoryBits = walls[i].category;
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
        fixture.SetUserData({ name: 'platform' });
        fixture.m_filter.categoryBits = entityCategory.PLATFORMS;
        fixtures.push(fixture);
    }

    // Stars
    let starX = 12;
    const stepX = 70;
    for (let i = 0; i < 12; i++) {
        stars[i] = this.add.image(starX, 0, 'star');
        const shape = new b2CircleShape(10 / this.pixelsPerMeter);
        const startPosX = stars[i].x / this.pixelsPerMeter;
        const startPosY = stars[i].y / this.pixelsPerMeter;
        const body = this.world.CreateBody({
            type: b2BodyType.b2_dynamicBody,
            position: {
                x: startPosX,
                y: startPosY
            }
        });
        body.SetFixedRotation(true);
        starBodies.push(body);
        const fixture = body.CreateFixture({ shape: shape, density: 1 });
        fixture.SetRestitution(Math$1.FloatBetween(0.4, 0.8));
        fixture.SetUserData({
            name: 'star',
            startPosX: startPosX,
            startPosY: startPosY,
            star: stars[i]
        });
        fixture.m_filter.categoryBits = entityCategory.STARS;
        fixture.m_filter.maskBits = entityCategory.PLATFORMS | entityCategory.PLAYER;
        starFixtures.push(fixture);
        starX += stepX;
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
    playerFixture.m_filter.categoryBits = entityCategory.PLAYER;
    playerFixture.m_filter.maskBits = entityCategory.PLATFORMS |
        entityCategory.STARS | entityCategory.TOP_WALL |
        entityCategory.REST_WALLS | entityCategory.BOMBS;

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

    const scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    });
    contactListener = new ContactListener(scoreText, stars.length,
        starFixtures, bombFixtures, this.player, this, this.pixelsPerMeter,
        this.world);
    this.world.SetContactListener(contactListener);
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

    if (!contactListener.isPaused()) {
        this.world.Step(0.016, { velocityIterations: 3, positionIterations: 2 });
    }

    for (let i = 0; i < bombFixtures.length; i++) {
        const userData = bombFixtures[i].GetUserData();
        userData.bomb.x = bombFixtures[i].GetBody().GetPosition().x * this.pixelsPerMeter;
        userData.bomb.y = bombFixtures[i].GetBody().GetPosition().y * this.pixelsPerMeter;
    }

    for (let i = 0; i < starBodies.length; i++) {
        const starBodyPosition = starBodies[i].GetPosition();
        stars[i].x = starBodyPosition.x * this.pixelsPerMeter;
        stars[i].y = starBodyPosition.y * this.pixelsPerMeter;
    }

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
//# sourceMappingURL=index.js.map
