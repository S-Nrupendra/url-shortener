const express = require('express')
const app = express();

// Middleware
app.use(express.json())

// Test route
app.get('/', (req, res)=>{
    res.json({message: 'Server is running'});
});

module.exports = app