const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // checking if email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "E-mail already exists" });
        }

        // hashing the password and saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // generate token and saving user
        const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: '1d' });
        await newUser.save();

        res.status(200).json({ msg: "User created successfully", token:token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ msg: "Server error during signup" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // no user found 
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // checking password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });

        res.status(200).json({ msg: "Login successful", token:token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ msg: 'Login failed due to server error' });
    }
});

module.exports = router;