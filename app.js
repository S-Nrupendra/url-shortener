const express = require('express');
const authRoutes = require('./routes/auth.routes');
const urlRoutes = require('./routes/url.routes');
const { redirectUrl } = require('./controllers/url.controller');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Redirect route - must be last
app.get('/:code', redirectUrl);

module.exports = app;