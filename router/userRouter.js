const express = require('express');
const userRouter = express.Router();
const User = require('../model/user');

// Create user or login if user already exists
userRouter.post('/create', async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = await User.findOne({ username }).exec();
        if (!user) {
            const avatarImages = [
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060522/NAMMTYoTqq_xl2k9j.png",
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060522/kFxcbwtAKx_okm1nz.png",
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060522/BzOYticHhQ_j7wsb7.png",
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060520/TsOMqzCcDU_bqtc4k.png",
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060516/fBHPIHSCct_ofwban.png",
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060516/YyvjQdTcAf_wp2kyw.png",
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060516/xYGoiwkbWz_txmpeh.png",
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060515/RvOjyHoMok_hz4mts.png",
                "https://res.cloudinary.com/dtpmltwhp/image/upload/v1720060514/jqwTAsYWUN_lmbqar.png"
            ];
            const randomIndex = Math.floor(Math.random() * avatarImages.length);
            const newUser = new User({ username, avatar: avatarImages[randomIndex] });
            user = await newUser.save();
            res.json({ user: newUser });
        } 
        else if (user.password === password) res.json(
            { user }
        );
        else {
            res.status(400).json({ error: 'User already exists' });
        }
    } catch (error) {
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
// userRouter.get('/', async (req, res) => {
//     try {
//         const users = await User.find({});

//         res.json(users);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });
userRouter.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        users.sort((a, b) => b.point - a.point);
        res.json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// attendance
userRouter.put('/attendance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user
            = await User.findByIdAndUpdate(id, { $inc: { point: 1 } }, { new: true }).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
userRouter.put('/missions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { missionName } = req.body;
        const now = new Date();
        const nowFormat = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const user = await User.findById(id).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const newMission = { missionName, date: nowFormat };
        user.missions.push(newMission);
        await user.save();

        const matchingMission = rewardData.find(mission => mission.missionName === missionName);
        console.log(`Matching mission: ${JSON.stringify(matchingMission)}`);
        console.log(`Matching mission: ${JSON.stringify(matchingMission.condition)}`);

        if (!matchingMission) {
            return res.status(400).json({ error: 'Mission not found' });
        }

        let conditionMet = false;

        if (matchingMission.condition) {
            if (matchingMission.condition.type === "games") {
                const gamesToday = user.gamesPerDay.find(day => day.date === nowFormat);
                const gamesCount = gamesToday ? gamesToday.count : 0;
                console.log(`Games today: ${gamesCount}, Required: ${matchingMission.condition.count}`);
                console.log(`Games today: ${gamesToday}, Required: ${matchingMission.condition.count}`);

                conditionMet = gamesCount >= matchingMission.condition.count;
            } else if (matchingMission.condition.type === "wins") {
                const winsToday = user.winsPerDay.find(day => day.date === nowFormat);
                const winsCount = winsToday ? winsToday.count : 0;
                console.log(`Wins today: ${winsCount}, Required: ${matchingMission.condition.count}`);
                conditionMet = winsCount >= matchingMission.condition.count;
            }
        } else {
            conditionMet = true;
        }

        console.log("Condition Met:", conditionMet);

        if (conditionMet) {
            const updatedUser = await User.findByIdAndUpdate(id, { $inc: { point: matchingMission.reward } }, { new: true }).exec();
            return res.json({ user: updatedUser });
        }

        // If conditions are not met, return the user without changes
        res.json({ user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// get all user for chart with point



// search user
userRouter.get('/search/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: { $regex: username, $options: 'i' } }).exec();
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



const rewardData = [
    { missionName: "Điểm danh", reward: 1, experience: 10 },
    { missionName: "Chiến thắng 3 trận", reward: 3, experience: 30, condition: { type: "wins", count: 0 } },
    { missionName: "Chơi 10 trận", reward: 5, experience: 50, condition: { type: "wins", count: 0 } },
    { missionName: "Chơi với 5 người bạn", reward: 4, experience: 40, condition: { type: "games", count: 0 } },
    { missionName: "Chiến thắng 10 trận", reward: 8, experience: 80, condition: { type: "wins", count: 0 } },
];


module.exports = userRouter;