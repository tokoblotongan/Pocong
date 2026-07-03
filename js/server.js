const io = require('socket.io')(3000, {
  cors: { origin: "*" }
});

const players = {}; // Menyimpan data posisi semua pemain

io.on('connection', (socket) => {
  console.log('Pemain terhubung:', socket.id);

  // Inisialisasi posisi pemain baru
  players[socket.id] = { x: 100, y: 300 };

  // Kirim data pemain yang ada ke pemain baru
  socket.emit('currentPlayers', players);
  // Beritahu pemain lain ada yang baru masuk
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  // Update posisi saat pemain bergerak
  socket.on('playerMovement', (data) => {
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('disconnect', socket.id);
  });
});
