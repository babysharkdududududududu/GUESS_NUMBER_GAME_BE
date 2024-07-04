const express = require('express');
const friendRouter = express.Router();
const User = require('../model/user');

// Create friend request
friendRouter.post('/add', async (req, res) => {
    try {
        const { username, friendname } = req.body;
        let user = await User.findOne({ username }).exec();
        let friend = await User.findOne({ username: friendname }).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the friend request already exists
        const existingFriendRequest = user.friends?.find(f => f.username === friendname);
        if (existingFriendRequest) {
            return res.status(400).json({ error: 'Friend request already exists' });
        }

        // Add the new friend request with status 1 (pending)
        if (!user.friends) {
            user.friends = [];
        }
        user.friends.push({
            _id: friend._id,
            username: friendname,
            avatar: friend.avatar,
            status: 1,
            createBy: username
        });

        if (!friend.friends) {
            friend.friends = [];
        }
        friend.friends.push({ 
            _id: user._id,
            username: username,
            avatar: user.avatar,
            status: 1,
            createBy: username
         });

        await user.save();
        await friend.save();

        // Fetch the updated user document
        user = await User.findOne({ username }).exec();

        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Accept friend request
friendRouter.post('/accept', async (req, res) => {
    try {
        const { username, friendname } = req.body;
        const user = await User.findOne({ username }).exec();
        const friend = await User.findOne({ username: friendname }).exec();

        if (!user || !friend) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Tìm yêu cầu kết bạn và cập nhật trạng thái thành 2 (accepted)
        const userFriendRequest = user.friends?.find(f => f.username === friendname);
        const friendFriendRequest = friend.friends?.find(f => f.username === username);
        if (!userFriendRequest || !friendFriendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        await User.updateOne({ username, 'friends.username': friendname },{ $set: { 'friends.$.status': 2 } }).exec();

        await User.updateOne({ username: friendname, 'friends.username': username },{ $set: { 'friends.$.status': 2 } }).exec();

        // Fetch the updated user document
        const updatedUser = await User
            .findOne({ username })
            .exec();
        res.json({ user: updatedUser });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Decline friend request
friendRouter.post('/decline', async (req, res) => {
    try {
        const { username, friendname } = req.body;
        await User.updateOne({ username }, { $pull: { friends: { username: friendname } } });
        await User.updateOne({ username: friendname }, { $pull: { friends: { username } } });
        const user = await User.findOne({ username });
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//get friend list
friendRouter.get('/get/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User
            .findOne({ username })
            .exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ friends: user.friends });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// delete friend
friendRouter.delete('/delete', async (req, res) => {
    try {
        const { username, friendname } = req.body;
        let user = await User
            .findOne({ username })
            .exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.friends = user.friends.filter(friend => friend !== friendname);
        await user.save();
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = friendRouter;