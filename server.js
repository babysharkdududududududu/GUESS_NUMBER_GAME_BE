const express = require('express');
const app = express();
const userRouter = require('./router/userRouter');
const roomRouter = require('./router/roomRouter');
const socket = require('socket.io');
const http = require('http');
const cors = require('cors');

require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use('/user', userRouter);
app.use('/room', roomRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const hostName = "192.168.1.9";
const port = process.env.PORT || 8000;
const uri = process.env.ATLAS_URI;

const server = app.listen(port, hostName, () => {
    console.log(`Example app listening on: http://${hostName}:${port}`);
});
// CORS configuration for socket.io
const io = socket(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://192.168.1.189:8000'],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});

// connect to socket to join room, play game, guess number lead to win or lose, leave room
// listen to port 8000
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('joinRoom', ({ roomNumber, secretNumber }, callback) => {
        // Replace with actual room validation logic
        const roomExists = true;
        if (roomExists) {
            socket.join(roomNumber);
            console.log(`User joined room ${roomNumber}`);
            callback({ room: roomNumber });
        } else {
            callback({ error: "Room does not exist or secret number is incorrect" });
        }
    });

    socket.on('createRoom', ({ secretNumber, room }, callback) => {
        // Here room is generated client-side, so no need to create a new room
        socket.join(room);
        console.log(`Room created: roomNumber=${room}, secretNumber=${secretNumber}`);
        callback({ room });
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
    // Join room
    socket.on('join-room', (data) => {
        console.log('Join room:', data);
        io.emit('join-room', data);
    });
    // Leave room
    socket.on('leave-room', (data) => {
        console.log('Leave room:', data);
        io.emit('leave-room', data);
    });
    // Start game
    socket.on('start-game', (data) => {
        console.log('Start game:', data);
        io.emit('start-game', data);
    });
    // Guess number
    socket.on('guess-number', (data) => {
        console.log('Guess number:', data);
        io.emit('guess-number', data);
    });
});


module.exports = app;


