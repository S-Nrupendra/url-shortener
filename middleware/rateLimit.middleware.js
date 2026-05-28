const rateLimit = require('express-rate-limit');

const shortenLimiter = rateLimit({
    windowMs: 60*60*1000, // 1 hour
    max: 10,
    keyGenerator: (req) => req.user._id.toString(),
    handler: (req, res) => {
        res.status(429).json({
            message: 'Too many requests. You can only shorten 10 urls per hour'
        });
    }
});

module.exports = {shortenLimiter};