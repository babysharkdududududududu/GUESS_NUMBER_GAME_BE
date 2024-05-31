const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

// user schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    point: { type: Number, default: 0 },
    numberWin: { type: Number, default: 0 },
    numberLose: { type: Number, default: 0 }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
