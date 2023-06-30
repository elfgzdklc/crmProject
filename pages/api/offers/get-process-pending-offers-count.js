const express = require('express');
const router = express.Router();
const Offers = require("../models/offers");


router.post('/api/offers/get-process-pending-offers-count', async (req, res) => {
    const offers = await Offers.findAll({
        where: {
            status: 4,
            revised: 0
        }
    })
    res.json(offers.length);
})

module.exports = router;
