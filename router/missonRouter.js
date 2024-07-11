const express = require('express');
const missionRouter = express.Router();
const Mission = require('../model/misson');
const User = require('../model/user');

// get all mission
missionRouter.get('/get', async (req, res) => {
    try {
        const missions = await Mission.find().exec();
        res.json({ missions });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//done mission
missionRouter.post('/done', async (req, res) => {
    try {
        const { id, userId } = req.body;
        console.log('Mission ID:', id);
        console.log('User ID:', userId);

        const mission = await Mission.findById(id).exec();
        if (!mission) {
            return res.status(404).json({ error: 'Mission not found' });
        }
        console.log('Mission:', mission);

        const user = await User.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User:', user);

        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        console.log('Current Date:', currentDate);

        if (mission.title === 'game') {
            const gameEntry = user.gamesPerDay.find(entry => entry.date === currentDate);
            console.log('Game Entry:', gameEntry);

            if (gameEntry && gameEntry.count >= mission.condition) {
                // The count matches the condition, proceed with your logic
                user.point += mission.points;
                await user.save();
                console.log('User points after update:', user.point);
                return res.status(200).json({ message: 'Mission accomplished', points: user.point });
            } else {
                return res.status(400).json({ error: 'Condition not met' });
            }
        } else if (mission.title === 'win') {
            const winEntry = user.winsPerDay.find(entry => entry.date === currentDate);
            console.log('Win Entry:', winEntry);

            if (winEntry && winEntry.count >= mission.condition) {
                // The count matches the condition, proceed with your logic
                user.point += mission.points;
                await user.save();
                console.log('User points after update:', user.point);
                return res.status(200).json({ message: 'Mission accomplished', points: user.point });
            } else {
                return res.status(400).json({ error: 'Condition not met' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid mission title' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});







module.exports = missionRouter;