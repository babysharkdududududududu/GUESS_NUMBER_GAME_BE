const express = require('express');
const roomRouter = express.Router();
const Room = require('../model/room');
const User = require('../model/user');

// Create room
// Create room
roomRouter.post('/create', async (req, res) => {
    try {
        const { createdBy } = req.body;

        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findById(createdBy);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tạo phòng mới với chủ phòng là người tạo
        const newRoom = new Room({
            createdBy,
            players: [createdBy],  // Thêm người tạo vào danh sách người chơi
            gameStatus: 'waiting',
            currentTurn: createdBy  // Khởi tạo currentTurn với người chơi đầu tiên
        });

        // Lưu phòng vào cơ sở dữ liệu
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
        // Kiểm tra xem phòng có tồn tại không bằng số phòng
        const room = await Room.findOne({ roomNumber });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Kiểm tra xem phòng đã đủ người chưa
        if (room.players.length >= 2) {
            return res.status(400).json({ message: 'Room is full' });
        }
        // Kiểm tra xem người chơi đã tồn tại trong phòng chưa
        if (room.players.includes(userId)) {
            return res.status(400).json({ message: 'User already in room' });
        }
        // Thêm người chơi vào phòng
        room.players.push(userId);
        room.playerNumbers.push({ player: userId, number: playerNumber });
        // Cập nhật trạng thái game nếu đủ người
        if (room.players.length === 2) {
            room.gameStatus = 'ongoing';
        }
        // Lưu phòng vào cơ sở dữ liệu
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
        const { roomId, userId } = req.body;
        // Kiểm tra xem phòng có tồn tại không
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        // Kiểm tra xem người chơi có tồn tại trong phòng không
        if (!room.players.includes(userId)) {
            return res.status(404).json({ message: 'User not in room' });
        }
        // Xóa người chơi khỏi phòng
        room.players = room.players.filter(player => player !== userId);
        room.playerNumbers = room.playerNumbers.filter(player => player.player !== userId);
        // Lưu phòng vào cơ sở dữ liệu
        await room.save();
        res.status(200).json(room);
    } catch (error) {
        console.error('Error leaving room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);
// Start game 
roomRouter.post('/start', async (req, res) => {
    try {
        const { roomId } = req.body;
        // Kiểm tra xem phòng có tồn tại không
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        // Kiểm tra xem phòng đã đủ người chưa
        if (room.players.length < 2) {
            return res.status(400).json({ message: 'Room is not full' });
        }
        // Kiểm tra xem game đã bắt đầu chưa
        if (room.gameStatus !== 'waiting') {
            return res.status(400).json({ message: 'Game already started' });
        }
        // Bắt đầu game
        room.gameStatus = 'ongoing';
        // Lưu phòng vào cơ sở dữ liệu
        await room.save();
        res.status(200).json(room);
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

// Make guess
roomRouter.post('/guess', async (req, res) => {
    try {
        const { roomNumber, userId, number } = req.body;
        // Kiểm tra xem phòng có tồn tại không bằng số phòng
        const room = await Room.findOne({ roomNumber });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        // Kiểm tra xem game đã bắt đầu chưa
        if (room.gameStatus !== 'ongoing') {
            return res.status(400).json({ message: 'Game not started' });
        }
        // Kiểm tra xem người chơi có tồn tại trong phòng không
        if (!room.players.includes(userId)) {
            return res.status(404).json({ message: 'User not in room' });
        }
        // Kiểm tra xem có phải lượt của người chơi không
        if (room.currentTurn.toString() !== userId) {
            return res.status(400).json({ message: 'Not your turn' });
        }
        // Thêm lượt đoán vào phòng
        room.guesses.push({ user: userId, number });
        // Kiểm tra xem người chơi đoán đúng số của đối phương chưa
        const opponent = room.players.find(player => player.toString() !== userId);
        const opponentNumber = room.playerNumbers.find(pn => pn.player.toString() === opponent.toString()).number;
        if (parseInt(number) === opponentNumber) {
            room.gameStatus = 'finished';
            room.winner = userId;
            await room.save();
            return res.status(200).json({
                message: 'Correct guess! Game over.',
                winner: userId,
                room
            });
        } else {
            // Chuyển lượt cho người chơi tiếp theo
            room.currentTurn = opponent;
            await room.save();
            return res.status(200).json({
                message: 'Incorrect guess. Turn switched.',
                room
            });
        }
    } catch (error) {
        console.error('Error making guess:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get room
roomRouter.get('/get/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        // Kiểm tra xem phòng có tồn tại không
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json(room);
    } catch (error) {
        console.error('Error getting room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

// Get all rooms
roomRouter.get('/get-all', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error getting all rooms:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

//delete room
roomRouter.delete('/delete/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        // Kiểm tra xem phòng có tồn tại không
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        // Xóa phòng
        await Room.findByIdAndDelete(roomId);
        res.status(200).json({ message: 'Room deleted' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

module.exports = roomRouter;
