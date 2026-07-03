const config = {
  type: Phaser.AUTO,
  width: 800, height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let socket, player, otherPlayers = {};

function preload() {
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/mushroom.png');
}

function create() {
  socket = io('http://localhost:3000');
  
  socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach(id => {
      if (id === socket.id) addPlayer(this, players[id]);
      else addOtherPlayer(this, id, players[id]);
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();
}

function addPlayer(scene, info) {
  player = scene.physics.add.sprite(info.x, info.y, 'player');
}

function update() {
  if (player) {
    if (this.cursors.left.isDown) player.x -= 5;
    if (this.cursors.right.isDown) player.x += 5;

    // Kirim posisi ke server
    socket.emit('playerMovement', { x: player.x, y: player.y });
  }
}
