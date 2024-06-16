const express = require('express');
const app = express();
const userRouter = require('./router/userRouter');
const roomRouter = require('./router/roomRouter');
const socket = require('socket.io');
const cors = require('cors');

require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Routers
app.use('/user', userRouter);
app.use('/room', roomRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
});

const hostName = "192.168.1.32";
const port = process.env.PORT || 8000;

const server = app.listen(port, hostName, () => {
    console.log(`Example app listening on: http://${hostName}:${port}`);
});

// Socket.IO configuration
const io = socket(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://192.168.1.8:8000'],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

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

    // socket.on('createRoom', ({ secretNumber, room }, callback) => {
    //     socket.join(room);
    //     console.log(`Room created: roomNumber=${room}, secretNumber=${secretNumber}`);
    //     callback({ room });
    //   });
    socket.on("create-room", (data) => {
        const { roomNumber, secretNumber } = data;
        socket.join(roomNumber);
        console.log(`Room created: roomNumber=${roomNumber}, secretNumber=${secretNumber}`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    // Join room
    socket.on('join-room', (data) => {
        console.log('Join room:', data);
        socket.join(data.room); // Ensure socket joins the room
        socket.to(data.room).emit('join-room', data); // Broadcast to all clients in room except sender
    });
    // socket.on('join-room', async ({ roomId, userId }) => {
    //     socket.join(roomId);
    //     const room = await room.findById(roomId).populate('players playerNumbers.player');

    //     if (room) {
    //         const opponent = room.players.find(player => player._id.toString() !== userId);
    //         if (opponent) {
    //             const opponentNumber = room.playerNumbers.find(pn => pn.player.toString() === opponent._id.toString()).number;
    //             socket.emit('opponent-info', {
    //                 opponentId: opponent._id,
    //                 opponentSecretNumber: opponentNumber
    //             });
    //         }
    //     }
    // });

    // Leave room
    socket.on('leave-room', (data) => {
        console.log('Leave room:', data);
        socket.leave(data.room); // Ensure socket leaves the room
        socket.to(data.room).emit('leave-room', data); // Broadcast to all clients in room except sender
    });

    // Start game
    socket.on('start-game', (data) => {
        console.log('Start game:', data);
        socket.to(data.room).emit('start-game', data); // Broadcast to all clients in room except sender
    });

    // Guess number
    socket.on('guess-number', (data) => {
        console.log('Guess number:', data);
        socket.to(data.room).emit('guess-number', data); // Broadcast to all clients in room except sender
    });
});

module.exports = app;
