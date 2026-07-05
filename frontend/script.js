const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let otherPlayers = {};
let cursors;
let platforms;

function preload() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 48);
    graphics.generateTexture('player', 32, 48);

    graphics.clear();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 48);
    graphics.generateTexture('otherPlayer', 32, 48);

    graphics.clear();
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(0, 0, 200, 20);
    graphics.generateTexture('platform', 200, 20);

    graphics.clear();
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, 800, 32);
    graphics.generateTexture('ground', 800, 32);

    graphics.destroy();
}

function create() {
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 584, 'ground');
    platforms.create(600, 450, 'platform');
    platforms.create(50, 350, 'platform');
    platforms.create(750, 280, 'platform');
    platforms.create(300, 220, 'platform');

    cursors = this.input.keyboard.createCursorKeys();

    const scene = this;

    socket.on('currentPlayers', (players) => {
        Object.keys(players).forEach((id) => {
            if (id === socket.id) {
                addPlayer(scene, players[id], true);
            } else {
                addPlayer(scene, players[id], false);
            }
        });
    });

    socket.on('newPlayer', (playerInfo) => {
        addPlayer(scene, playerInfo, false);
    });

    socket.on('playerMoved', (playerInfo) => {
        if (otherPlayers[playerInfo.id]) {
            otherPlayers[playerInfo.id].setPosition(playerInfo.x, playerInfo.y);
        }
    });

    socket.on('disconnect', (playerId) => {
        if (otherPlayers[playerId]) {
            otherPlayers[playerId].destroy();
            delete otherPlayers[playerId];
        }
    });
}

function addPlayer(scene, playerInfo, isLocal) {
    if (isLocal) {
        player = scene.physics.add.sprite(playerInfo.x, playerInfo.y, 'player');
        player.setBounce(0.1);
        player.setCollideWorldBounds(true);
        scene.physics.add.collider(player, platforms);
    } else {
        const otherPlayer = scene.physics.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer');
        otherPlayer.setBounce(0.1);
        otherPlayer.setCollideWorldBounds(true);
        scene.physics.add.collider(otherPlayer, platforms);
        otherPlayers[playerInfo.id] = otherPlayer;
    }
}

function update() {
    if (!player) return;

    const prevX = player.x;
    const prevY = player.y;

    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-450);
    }

    if (player.x !== prevX || player.y !== prevY) {
        socket.emit('playerMovement', { x: player.x, y: player.y });
    }
}
