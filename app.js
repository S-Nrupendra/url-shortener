const express = require('express');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res)=>{
    res.json({message: 'Server is running'});
});

const { protect } = require('./middleware/auth.middleware');

app.get('/api/test-protect', protect, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

module.exports = app;