const express = require('express');
const router = express.Router();

const Notification = require('../model/notification');

// middleware
async function getNotification(req, res, next) {
    let notification;
    try {
        notification = await Notification.findById(req.params.id);
        if (notification == null) {
            return res.status(404).json({ message: 'Cannot find notification' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
    res.notification = notification;
    next();
}

// get all notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// get one notification
router.get('/:id', getNotification, (req, res) => {
    try {
        res.json(res.notification);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// create notification
router.post('/', async (req, res) => {
    const notification = new Notification({
        content: req.body.content,
        status: req.body.status,
        avatar: req.body.avatar,
        image: req.body.image,
        link: req.body.link,
    });
    try {
        const newNotification = await notification.save();
        res.status(200).json(newNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// update notification
router.patch('/:id', getNotification, async (req, res) => {
    if (req.body.content != null) {
        res.notification.content = req.body.content;
    }
    if (req.body.status != null) {
        res.notification.status = req.body.status;
    }
    if (req.body.avatar != null) {
        res.notification.avatar = req.body.avatar;
    }
    if (req.body.image != null) {
        res.notification.image = req.body.image;
    }
    if (req.body.link != null) {
        res.notification.link = req.body.link;
    }
    try {
        const updatedNotification = await res.notification.save();
        res.json(updatedNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// delete notification
router.delete('/:id', getNotification, async (req, res) => {
    try {
        await res.notification.remove();
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;