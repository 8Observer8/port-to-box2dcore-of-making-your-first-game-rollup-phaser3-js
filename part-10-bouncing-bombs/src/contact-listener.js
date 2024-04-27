import { b2BodyType } from '@box2d/core';
import { b2ContactListener } from '@box2d/core';
import { b2CircleShape } from '@box2d/core';
import { b2Vec2 } from '@box2d/core';
import { b2WorldManifold } from '@box2d/core';
import { entityCategory } from './entity-category.js';
import { Math } from "phaser3";

export default class ContactListener extends b2ContactListener {

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

                    const x = (this.player.x < 400) ? Math.Between(400, 800) : Math.Between(0, 400);
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
                    bombBody.SetLinearVelocity(new b2Vec2(Math.Between(-3, 3), 2));
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
