const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

// user schema
const Schema = mongoose.Schema;
const gamePerDaySchema = new Schema({
    date: { type: String, required: true },
    count: { type: Number, default: 0 },
}, {
    _id: false
});
const winPerDaySchema = new Schema({
    date: { type: String, required: true },
    count: { type: Number, default: 0 },
}, {
    _id: false
});
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    point: { type: Number, default: 0 },
    numberWin: { type: Number, default: 0 },
    numberLose: { type: Number, default: 0 },
    numberOfGame: { type: Number, default: 0 },
    gamesPerDay: { type: [gamePerDaySchema], default: [] },
    winsPerDay: { type: [winPerDaySchema], default: [] },
    avatar: { type: String},
    friends: { type: Array, default: [] },
    coin: { type: Number, default: 0 },
    level : { type: Number, default: 1 },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
