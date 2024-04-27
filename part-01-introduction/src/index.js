import { b2World } from '@box2d/core';
import { WEBGL, Game, Scale } from 'phaser3';

const config = {
    type: WEBGL,

    canvas: document.getElementById('renderCanvas'),
    width: 800,
    height: 600,
    scaleMode: Scale.ScaleModes.FIT,
    autoCenter: Scale.Center.CENTER_BOTH,

    autoFocus: true,
    scene: { preload, create, update },
    backgroundColor: '#555'
};

const game = new Game(config);
const world = b2World.Create({ x: 0, y: 10 });

function preload() {}

function create() {
    console.log(`gravity: ${world.GetGravity().x}, ${world.GetGravity().y}`);
}

function update() {}
