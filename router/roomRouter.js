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
        user.numberOfGame += 1;

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
        //kiểm tra nếu chủ phòng rời phòng thì chuyển chủ phòng mới và xóa chủ phòng cũ
        if (room.createdBy.toString() === userId) {
            if (room.players.length > 0) {
                // Assign the next player as the new owner
                room.createdBy = room.players[0];
                room.currentTurn = room.players[0];
            } else {
                // No other players left, delete the room
                await Room.findByIdAndDelete(room._id);
                return res.status(200).json({ message: 'Room deleted' });
            }
        }
        //kiểm tra nếu người chơi rời phòng thì xóa người chơi đó
        if (room.players.toString() === userId) {
            await User.findByIdAndDelete(userId);
            await Room.updateOne({ roomNumber: roomNumber }, { $set: { guesses: [] } });
            return res.status(200).json({ message: 'Người chơi đã thoát khỏi phòng, hãy đợi người khác nhé' });
        }
        await Room.updateOne({ _id: room._id }, { $set: { guesses: [] } });
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

        const now = new Date();
        const elapsedTime = (now - new Date(room.currentTurnStartTime)) / 1000; // elapsed time in seconds

        if (elapsedTime > 60) {
            const opponent = room.players.find(player => player.toString() !== userId);
            room.currentTurn = opponent;
            room.currentTurnStartTime = now;
            await room.save();
            return res.status(200).json({
                message: 'Turn time exceeded. Turn switched.',
                result: { currentTurn: room.currentTurn.toString(), result: room.guesses },
            });
        }

        room.guesses.push({ user: userId, number });

        const opponent = room.players.find(player => player.toString() !== userId);
        const opponentNumber = room.playerNumbers.find(pn => pn.player.toString() === opponent.toString()).number;

        if (parseInt(number) === opponentNumber) {
            room.gameStatus = 'finished';
            room.winner = userId;
            const winningPlayer = await User.findById(userId);
            const losingPlayer = await User.findById(opponent);
            const currentDate = new Date().toISOString().slice(0, 10); // Lấy ngày hiện tại

            const updateGamesPerDay = (player) => {
                const today = player.gamesPerDay.find(game => game.date === currentDate);
                if (today) {
                    today.count += 1;
                } else {
                    player.gamesPerDay.push({ date: currentDate, count: 1 });
                }
            };
            const updateWinsPerDay = (player) => {
                const today = player.winsPerDay.find(win => win.date === currentDate);
                if (today) {
                    today.count += 1;
                } else {
                    player.winsPerDay.push({ date: currentDate, count: 1 });
                }
            };

            winningPlayer.numberWin += 1;
            winningPlayer.numberOfGame += 1;
            updateGamesPerDay(winningPlayer);
            updateWinsPerDay(winningPlayer);
            if (winningPlayer.numberWin < 10) {
                winningPlayer.point += 10;
            }
            else if (winningPlayer.numberWin < 50) {
                winningPlayer.point += 5;
            }
            else if (winningPlayer.numberWin < 100) {
                winningPlayer.point += 2;
            }
            else {
                winningPlayer.point += 1;
            }
            await winningPlayer.save();

            losingPlayer.numberLose += 1;
            losingPlayer.numberOfGame += 1;
            updateGamesPerDay(losingPlayer);
            if (losingPlayer.numberLose < 10) {
                losingPlayer.point = losingPlayer.point;
            }
            else if (losingPlayer.point <= 0) {
                losingPlayer.point = 0;
            }
            else if (losingPlayer.numberLose < 50) {
                losingPlayer.point -= 2;
            }
            else if (losingPlayer.numberLose < 100) {
                losingPlayer.point -= 5;
            }
            else {
                losingPlayer.point -= 8;
            }
            await losingPlayer.save();
            await room.save();
            return res.status(200).json({
                message: 'Correct guess! Game over.',
                winner: userId,
                result: { winner: userId, result: room.guesses },
            });
        } else {
            room.currentTurn = opponent;
            room.currentTurnStartTime = now;
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
//delete room with createdBy
roomRouter.delete('/delete-rooms/:createdBy', async (req, res) => {
    try {
        const { createdBy } = req.params;
        const result = await Room.deleteMany({ createdBy: createdBy });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No rooms found to delete' });
        }
        res.status(200).json({ message: 'Rooms deleted', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error deleting rooms:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = roomRouter;
