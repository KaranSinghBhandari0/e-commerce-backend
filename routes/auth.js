const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/isAdmin', async (req, res) => {
    try {
        const { authToken } = req.body;

        // Verify the token
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        // Check if the user exists and is an admin
        if (!user || user.id !== process.env.AdminID) {
            return res.status(403).json({ isAdmin: false });
        }

        return res.status(200).json({ isAdmin: true });
    } catch (error) {
        console.error("Error in verify admin:", error.message);
        res.status(500).json({ isAdmin: false });
    }
});

module.exports = router;