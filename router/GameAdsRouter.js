const express = require('express');
const router = express.Router();
const GameAds = require('../model/gameAds');

// middleware
async function getGameAd(req, res, next) {
    let gameAd;
    try {
        gameAd = await GameAds.findById(req.params.id);
        if (gameAd == null) {
            return res.status(404).json({ message: 'Cannot find game ad' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
    res.gameAd = gameAd;
    next();
}

// get all game ads
router.get('/', async (req, res) => {
    try {
        const gameAds = await GameAds.find();
        res.json(gameAds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// get one game ad
router.get('/:id', getGameAd, (req, res) => {
    try {
        res.json(res.gameAd);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// create game ad
router.post('/', async (req, res) => {
    const gameAd = new GameAds({
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        link: req.body.link,
        status: req.body.status,
        avatar: req.body.avatar,
    });
    try {
        const newGameAd = await gameAd.save();
        res.status(200).json(newGameAd);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// update game ad
router.patch('/:id', getGameAd, async (req, res) => {
    if (req.body.title != null) {
        res.gameAd.title = req.body.title;
    }
    if (req.body.description != null) {
        res.gameAd.description = req.body.description;
    }
    if (req.body.image != null) {
        res.gameAd.image = req.body.image;
    }
    if (req.body.link != null) {
        res.gameAd.link = req.body.link;
    }
    if (req.body.status != null) {
        res.gameAd.status = req.body.status;
    }
    if (req.body.avatar != null) {
        res.gameAd.avatar = req.body.avatar;
    }
    try {
        const updatedGameAd = await res.gameAd.save();
        res.json(updatedGameAd);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// delete game ad
router.delete('/:id', getGameAd, async (req, res) => {
    try {
        await res.gameAd.remove();
        res.json({ message: 'Deleted game ad' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
