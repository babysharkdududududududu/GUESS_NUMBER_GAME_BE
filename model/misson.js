const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const missionSchema = new Schema({
    missionName: { type: String, required: true },
    reward: { type: Number, required: true },
    experience: { type: Number, required: true },
    condition: {
        type: {
            type: String,
            enum: ['wins', 'games'], // Loại điều kiện có thể là 'wins' hoặc 'games'
            required: true
        },
        count: { type: Number, default: 0 } // Số lần thực hiện điều kiện, mặc định là 0
    }
});

const Mission = mongoose.model('Mission', missionSchema);

module.exports = Mission;
