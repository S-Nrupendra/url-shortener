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

module.exports = app;