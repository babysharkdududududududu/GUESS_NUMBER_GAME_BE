const express = require('express');
const app = express();
const userRouter = require('./router/userRouter');
const roomRouter = require('./router/roomRouter');
const socket = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/user', userRouter);
app.use('/room', roomRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// CORS configuration for socket.io
const io = socket(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://192.168.1.6:8000'],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});

// connect to socket to join room, play game, guess number lead to win or lose, leave room
// listen to port 8000
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('join-room', (roomNumber) => {
        socket.join(roomNumber);
        console.log(`User joined room ${roomNumber}`);
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
    // Create room
    socket.on('create-room', (data) => {
        console.log('Create room:', data);
        io.emit('create-room', data);
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


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
