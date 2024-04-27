I replaced Arcade Physics with [box2d/core](https://lusito.github.io/box2d.ts/) in the examples of the [Making your first Phaser 3 game](https://phaser.io/tutorials/making-your-first-phaser-3-game) tutorial

[Topic on the Phaser forum](https://phaser.discourse.group/t/i-replaced-arcade-physics-with-box2d-core-in-the-examples-of-the-making-your-first-phaser-3-game-tutorial/14272)

Playground:

- [Part 01: Introduction](https://plnkr.co/edit/YaAaamdKkjXGfNZw?preview)
- [Part 02. Loading assets](https://plnkr.co/edit/24VDdeuBKyzOZccr?preview)
- [Part 03. World Building](https://plnkr.co/edit/Qv1LTe3Pa5xAEgAG?preview)
- [Part 04. The Platforms (explanation)](https://plnkr.co/edit/tjKCiQjVWxWdWKss?preview)
- [Part 05. Ready Player One](https://plnkr.co/edit/YDd8P7u225nsjsRR?preview)
- [Part 06. Body velocity](https://plnkr.co/edit/pWG2rAffFQGt7uVy?preview)
- [Part 07. Controlling the player with the keyboard](https://plnkr.co/edit/SrMlC1Q7q2dmo6wZ?preview)
- [Part 08. Stardust](https://plnkr.co/edit/FkkU8JU8qEsByZPO?preview)
- [Part 09. A score to settle](https://plnkr.co/edit/WaQjQwQNvvl7Eihu?preview)
- [Part 10. Bouncing Bombs](https://plnkr.co/edit/cQRkyfh5RoMr7OVW?preview)

![image](https://github.com/8Observer8/port-to-box2dcore-of-making-your-first-game-rollup-phaser3-js/assets/3908473/90af7441-e56f-40c5-abb7-e4ecbb2731d9)

Instructions for building and running the project in debug and release:

- Download and unzip this repository

- Open the command line terminal and go to the lesson folder

- Install the next packages globally with the command:

> npm i -g http-server rollup uglify-js

- Add the Rollup bin folder to the Path. Type this command to know where npm was installed `npm config get prefix`. This command will show you the npm location. You will find the "node_modules" folder there. Go to the "rollup/bin" folder and copy this path, for example for me: `C:\Users\8Observer8\AppData\Roaming\npm\node_modules\rollup\dist\bin`. Add this folder to the path variable.

- Run http-server in the project directory:

> http-server -c-1

Note. The `-c-1` key allows you to disable caching.

- Start development mode with the following command:

> npm run dev

Note. Rollup will automatically keep track of saving changes to files and build a new index.js file ready for debugging. You can debug your project step by step in the browser by setting breakpoints.

- Go to the browser and type the address: localhost:8080/index.html

- Create a compressed file ready for publishing. Stop development mode, for example, with this command Ctrl + C in CMD, if it was launched before and enter the command:

> npm run release

Note. After this command, Rollup will create a compressed index.js file. Compression is done using the uglify-js package.

If you want to thank me: https://8observer8.github.io/donate.html
