const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // Dalam produksi, disarankan mengganti "*" dengan domain Vercel Anda
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

let players = {};

io.on('connection', (socket) => {
    console.log('Pemain terhubung:', socket.id);

    // Buat data pemain baru
    players[socket.id] = {
        x: Math.floor(Math.random() * 700) + 50,
        y: 300,
        id: socket.id
    };

    // Kirim data pemain ke pemain baru
    socket.emit('currentPlayers', players);
    
    // Beritahu pemain lain ada pemain baru
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Update posisi saat ada pergerakan
    socket.on('playerMovement', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            // Kirim ke semua orang kecuali pengirim
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Tangani disconnect
    socket.on('disconnect', () => {
        console.log('Pemain keluar:', socket.id);
        delete players[socket.id];
        io.emit('disconnect', socket.id);
    });
});

http.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
