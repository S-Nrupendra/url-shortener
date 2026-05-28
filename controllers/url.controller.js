const Url = require('../models/Url.model');
const generateCode = require('../utils/generateCode');
const redis = require('../config/redis');

// @desc    Shorten a URL
// @route   POST /api/urls/shorten
// @access  Private
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, expiresInDays } = req.body;

    // Validate URL
    if (!originalUrl) {
      return res.status(400).json({ message: 'URL is required' });
    }

    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Generate unique short code
    let shortCode;
    let exists;
    do {
      shortCode = generateCode();
      exists = await Url.findOne({ shortCode });
    } while (exists);

    // Handle custom expiry
    let expiresAt;
    if (expiresInDays) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    // Create URL document
    const url = await Url.create({
      originalUrl,
      shortCode,
      userId: req.user._id,
      ...(expiresAt && { expiresAt })
    });

    res.status(201).json({
      message: 'URL shortened successfully',
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      shortCode,
      originalUrl,
      expiresAt: url.expiresAt
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Redirect to original URL
// @route   GET /:code
// @access  Public
const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    // check Redis cache first
    const cached = await redis.get(code);
    if(cached){
      console.log(`Cache hit: ${code}`);
      return res.redirect(cached);
    }

    // Not in cache - query MongoDB
    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Check expiry
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ message: 'URL has expired' });
    }

    // Increment click count
    url.clicks += 1;
    await url.save();

    // Store in Redis cache - expire after 24 hours
    await redis.set(code, url.originalUrl, 'EX', 86400);

    res.redirect(302, url.originalUrl);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all URLs for logged in user
// @route   GET /api/urls/my-urls
// @access  Private
const getMyUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      count: urls.length,
      urls
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a URL
// @route   DELETe /api/urls/:code
// @access  Private
const deleteUrl = async (req, res) => {
  try{
    const {code} = req.params;
    const url = await Url.findOne({shortCode: code});

    if(!url){
      return res.status(404).json({message: 'URL not found'});
    }

    // Check ownership
    if(url.userId.toString() !== req.user._id.toString()){
      return res.status(403).json({message: 'Not authorized to delete this URL'});
    }

    await url.deleteOne();

    // Remove from Redis cache too
    await redis.del(code);

    res.status(200).json({message: 'URL deleted successfully'});
  } catch(error){
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

module.exports = { shortenUrl, redirectUrl, getMyUrls, deleteUrl };