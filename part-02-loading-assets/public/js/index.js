import { b2World } from '@box2d/core';
import { WEBGL, Scale, Game } from 'phaser3';

const config = {
    type: WEBGL,

    width: 800,
    height: 600,
    scaleMode: Scale.ScaleModes.FIT,
    autoCenter: Scale.Center.CENTER_BOTH,

    autoFocus: true,
    scene: { preload, create, update },
    backgroundColor: "#eee"
};

new Game(config);
const world = b2World.Create({ x: 0, y: 10 });

function preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
        frameWidth: 32,
        frameHeight: 48
    });
}

function create() {
    this.add.image(400, 300, "sky");
    this.add.image(400, 300, "star");
    console.log(`gravity: ${world.GetGravity().x}, ${world.GetGravity().y}`);
}

function update() {}
//# sourceMappingURL=index.js.map
