const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameAdsSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    avatar: { type: String, required: true },
}, {
    timestamps: true
});

const GameAds = mongoose.model('GameAds', gameAdsSchema);
module.exports = GameAds;