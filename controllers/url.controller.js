const Url = require('../models/Url.model');
const generateCode = require('../utils/generateCode');

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

    res.redirect(url.originalUrl);

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

module.exports = { shortenUrl, redirectUrl, getMyUrls };