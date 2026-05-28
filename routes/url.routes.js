const express = require('express');
const router = express.Router();
const {shortenUrl, getMyUrls, deleteUrl} = require('../controllers/url.controller');
const {protect} = require('../middleware/auth.middleware');
const {shortenLimiter} = require('../middleware/rateLimit.middleware');

router.post('/shorten', protect, shortenLimiter, shortenUrl);
router.get('/my-urls', protect, getMyUrls);
router.delete('/:code', protect, deleteUrl);

module.exports = router;