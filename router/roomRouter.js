const express = require('express');
const roomRouter = express.Router();
const Room = require('../model/room');
const User = require('../model/user');

// Create room
roomRouter.post('/create', async (req, res) => {
    try {
        const { createdBy, playerNumber } = req.body;
        const user = await User.findById(createdBy);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newRoom = new Room({
            createdBy,
            players: [createdBy],
            playerNumbers: [{ player: createdBy, number: playerNumber }],
            gameStatus: 'waiting',
            currentTurn: createdBy
        });

        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Join room
roomRouter.post('/join', async (req, res) => {
    try {
        const { roomNumber, userId, playerNumber } = req.body;
        const room = await Room.findOne({ roomNumber });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (room.players.length >= 2) {
            return res.status(400).json({ message: 'Room is full' });
        }

        if (room.players.includes(userId)) {
            return res.status(400).json({ message: 'User already in room' });
        }

        room.players.push(userId);
        room.playerNumbers.push({ player: userId, number: playerNumber });

        if (room.players.length === 2) {
            room.gameStatus = 'ongoing';
        }

        await room.save();
        res.status(200).json(room);
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Leave room
roomRouter.post('/leave', async (req, res) => {
    try {
        const { roomNumber, userId } = req.body;
        const room = await Room.findOne(roomNumber);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (!room.players.includes(userId)) {
            return res.status(404).json({ message: 'User not in room' });
        }

        room.players = room.players.filter(player => player.toString() !== userId);
        room.playerNumbers = room.playerNumbers.filter(player => player.player.toString() !== userId);

        if (room.players.length < 2) {
            room.gameStatus = 'waiting';
        }
        //kiểm tra nếu chủ phòng rời phòng thì xóa phòng
        if (room.createdBy.toString() === userId) {
            await Room.findByIdAndDelete(room._id);
            return res.status(200).json({ message: 'Room deleted' });
        }

        await room.save();
        res.status(200).json(room);
    } catch (error) {
        console.error('Error leaving room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start game
roomRouter.post('/start', async (req, res) => {
    try {
        const { roomId } = req.body;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.players.length < 2) {
            return res.status(400).json({ message: 'Room is not full' });
        }

        if (room.gameStatus !== 'waiting') {
            return res.status(400).json({ message: 'Game already started' });
        }

        room.gameStatus = 'ongoing';
        await room.save();
        res.status(200).json(room);
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Make guess
// roomRouter.post('/guess', async (req, res) => {
//     try {
//         const { roomNumber, userId, number } = req.body;
//         const room = await Room.findOne({ roomNumber });
//         if (!room) {
//             return res.status(404).json({ message: 'Room not found' });
//         }

//         if (room.gameStatus !== 'ongoing') {
//             return res.status(400).json({ message: 'Game not started' });
//         }

//         if (!room.players.includes(userId)) {
//             return res.status(404).json({ message: 'User not in room' });
//         }

//         if (room.currentTurn.toString() !== userId) {
//             return res.status(400).json({ message: 'Not your turn' });
//         }

//         room.guesses.push({ user: userId, number });
//         const opponent = room.players.find(player => player.toString() !== userId);
//         const opponentNumber = room.playerNumbers.find(pn => pn.player.toString() === opponent.toString()).number;

//         if (parseInt(number) === opponentNumber) {
//             room.gameStatus = 'finished';
//             room.winner = userId;
//             await room.save();
//             return res.status(200).json({
//                 message: 'Correct guess! Game over.',
//                 winner: userId,
//                 room
//             });
//         } else {
//             room.currentTurn = opponent;
//             await room.save();
//             return res.status(200).json({
//                 message: 'Incorrect guess. Turn switched.',
//                 room
//             });
//         }
//     } catch (error) {
//         console.error('Error making guess:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });
roomRouter.post('/guess', async (req, res) => {
    try {
      const { roomNumber, userId, number } = req.body;
      const room = await Room.findOne({ roomNumber });
  
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      if (room.gameStatus !== 'ongoing') {
        return res.status(400).json({ message: 'Game not started' });
      }
  
      if (!room.players.includes(userId)) {
        return res.status(404).json({ message: 'User not in room' });
      }
  
      if (room.currentTurn.toString() !== userId) {
        return res.status(400).json({ message: 'Not your turn' });
      }
  
      room.guesses.push({ user: userId, number });
  
      const opponent = room.players.find(player => player.toString() !== userId);
      const opponentNumber = room.playerNumbers.find(pn => pn.player.toString() === opponent.toString()).number;
  
      if (parseInt(number) === opponentNumber) {
        room.gameStatus = 'finished';
        room.winner = userId;
        await room.save();
        return res.status(200).json({
          message: 'Correct guess! Game over.',
          winner: userId,
          result: { winner: userId, result: room.guesses },
        });
      } else {
        room.currentTurn = opponent;
        await room.save();
        return res.status(200).json({
          message: 'Incorrect guess. Turn switched.',
          result: { currentTurn: room.currentTurn.toString(), result: room.guesses },
        });
      }
    } catch (error) {
      console.error('Error making guess:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  

// Get room
roomRouter.get('/get/:roomId', async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const room = await Room.findOne(roomNumber);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json(room);
    } catch (error) {
        console.error('Error getting room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all rooms
roomRouter.get('/get-all', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error getting all rooms:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete room
roomRouter.delete('/delete/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await Room.findByIdAndDelete(roomId);
        res.status(200).json({ message: 'Room deleted' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = roomRouter;
