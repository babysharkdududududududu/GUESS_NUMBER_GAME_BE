const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    content: { type: String, required: true },
    status: { type: String, enum: ['read', 'unread'], default: 'unread' },
    avatar: { type: String, required: true },
    image: { type: String },
    link: { type: String },
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
