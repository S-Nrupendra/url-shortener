const express = require('express');
const router = express.Router();
const {shortenUrl, getMyUrls} = require('../controllers/url.controller');
const {protect} = require('../middleware/auth.middleware');

router.post('/shorten', protect, shortenUrl);
router.get('/my-urls', protect, getMyUrls);

module.exports = router;