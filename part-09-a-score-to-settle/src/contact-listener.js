import { b2BodyType } from '@box2d/core';
import { b2ContactListener } from '@box2d/core';
import { entityCategory } from './entity-category.js';

export default class ContactListener extends b2ContactListener {

    constructor(scoreText, initialNumberOfStars, starFixtures) {
        super();
        this.scoreText = scoreText;
        this.score = 0;
        this.initialNumberOfStars = initialNumberOfStars;
        this.starFixtures = starFixtures;
        this.collectedNumberOfStars = 0;
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

        if ((nameA == "player" && nameB == "star") ||
            (nameA == "star" && nameB == "player")) //
        {
            let starBody, starFixture, starUserData;

            if (nameA == "player" && nameB == "star") {
                starFixture = fixtureB;
                starBody = fixtureB.GetBody();
                starUserData = userDataB;
            } else if (nameA == "star" && nameB == "player") {
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
            }, 0);
        }
    }
}
