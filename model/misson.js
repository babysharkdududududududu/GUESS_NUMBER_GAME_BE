const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const missionSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: Number, required: true },
    condition: {
        type: {
            type: String,
            required: true,
            enum: ['win', 'game']
        },
        value: { type: Number, required: true }
    }
});

const Mission = mongoose.model('Mission', missionSchema);

module.exports = Mission;
