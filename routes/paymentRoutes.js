const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
const { isLoggedIn, findUser } = require('../Middlewares/Auth');
const User = require('../models/user');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order
router.post('/create-order', isLoggedIn, async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100, // amount in the smallest currency unit (e.g., paisa)
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`,
        };
        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Store orderId and paymentId in user DB
router.post('/save-order', async (req, res) => {
    try {
        const { orderId, paymentId } = req.body;

        const userId = findUser(req); 
        await User.findByIdAndUpdate(
            userId,
            { $push: { orders: { orderId, paymentId } } },
            { new: true }
        );

        res.status(200).json({ msg: 'Order saved successfully' });
    } catch (error) {
        console.error('Error saving Order:', error);
        res.status(500).json({ msg: 'Order not saved' });
    }
});

// Fetch all orders of a user
router.get('/orders', async (req, res) => {
    try {
        const userId = findUser(req); // Assuming findUser is a utility function to get the user's ID from the request
        const user = await User.findById(userId); // Await the result of the database call
        const orders = user.orders; // Retrieve the orders from the user's data
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ msg: 'Failed to fetch orders' });
    }
});

// Fetch order details by payment ID
router.get('/order-details/:paymentId', async (req, res) => {
    const {paymentId} = req.params;

    try {
        const payment = await razorpayInstance.payments.fetch(paymentId)
        if(!payment){
            return res.status(500).json({ msg : "Error at razorpay loading"})
        }
        res.status(200).json({ orderDetails : payment });
    } catch(error) {
        res.status(500).json("failed to fetch payment")
    }
});

module.exports = router;
