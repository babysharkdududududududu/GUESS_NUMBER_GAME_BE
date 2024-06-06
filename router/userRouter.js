const express = require('express');
const userRouter = express.Router();
const User = require('../model/user');

// Create user or login if user already exists
userRouter.post('/create', async (req, res) => {
    try {
        const { username } = req.body;
        let user = await User.findOne({ username }).exec();
        if (!user) {
            const newUser = new User({ username });
            user = await newUser.save();
            res.json({ user: newUser });
        } else {
            res.json({ user });
        }
    } catch (error) {
        console.error('Error creating user:', error); // Log lỗi chi tiết
        res.status(400).json({ error: error.message });
    }
});

//get detail user
userRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User
            .findById(id)
            .exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
);
// get user by username
userRouter.get('/username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User
            .findOne({ username })
            .exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
);

// get all user
userRouter.get('/', async (req, res) => {
    try {
        const users = await User.find().exec();
        res.json({ users });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
);
module.exports = userRouter;