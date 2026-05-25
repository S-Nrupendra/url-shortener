const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res)=> {
    try{
        const {name, email, password} = req.body;

        // Check if all fields are provided
        if(!name || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({message: 'Email already registered'});
        }

        // Create new user
        const user = await User.create({name, email, password});

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        // Check if fields are provided
        if(!email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }

        // Find user by email
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid credentials'});
        }

        // Compaer password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'});
        }

        // Generate JWT
        const token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

module.exports = {register, login};