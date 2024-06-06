const express = require('express');
const userRouter = express.Router();
const User = require('../model/user');

//create user
userRouter.post('/create', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            throw new Error('Username is required');
        }
        const user = new User({ username });
        await user.save();
        res.status(200).json({ user });
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