const express = require('express');
const router = express.Router({ mergeParams: true });
const {findUser} = require('../Middlewares/Auth'); 
const User = require('../models/user');
const Product = require('../models/product')

// Add to cart
router.post('/add', async (req, res) => {
    const { productID } = req.body;

    try {
        const currUser = await User.findById(findUser(req));
    
        // Check if the product is already in the cart
        const existingProduct = currUser.cart.find(item => item._id.toString() === productID);

        if (existingProduct) {
            // If the product is already in the cart, increase its quantity
            existingProduct.quantity += 1;
        } else {
            // If the product is not in the cart, add it with a quantity of 1
            currUser.cart.push({ _id: productID, quantity: 1 });
        }

        await currUser.save();
        res.status(200).json({ msg: "Product added to cart" });
    } catch (error) {
        res.status(500).json({ msg: "Error adding product to cart", error: error.message });
    }
});

// get cart products
router.get('/getCartProducts', async (req, res) => {
    try {
        const currUser = await User.findById(findUser(req));
        const items = [...currUser.cart];

        // Create an array of promises for fetching products
        const productPromises = items.map(async (item) => {
            const product = await Product.findById(item._id);
            return { product, quantity: item.quantity }; // Return the product and its quantity
        });

        // Wait for all product lookups to resolve
        const CartProducts = await Promise.all(productPromises);

        res.status(200).json({ products: CartProducts });
    } catch (error) {
        console.error('Error fetching cart products:', error);
        res.status(500).json({ msg: "Error fetching cart products", error: error.message });
    }
});

// Delete a cart item
router.delete('/remove/:productID', async (req, res) => {
    const { productID } = req.params;

    try {
        const currUser = await User.findById(findUser(req));
        
        // Filter out the item with the matching productID
        currUser.cart = currUser.cart.filter(item => item._id.toString() !== productID);
        
        await currUser.save();
        res.status(200).json({ msg: "Product removed from cart" });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ msg: "Error removing product from cart", error: error.message });
    }
});

// Update cart quantity
router.put('/update', async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const currUser = await User.findById(findUser(req));

        // Check if the product is in the cart
        const existingProduct = currUser.cart.find(item => item._id.toString() === productId);

        if (existingProduct) {
            // Update the quantity
            if (quantity > 0) {
                existingProduct.quantity = quantity; // Update to the new quantity
            } else {
                // If quantity is less than or equal to 0, remove the product from the cart
                currUser.cart = currUser.cart.filter(item => item._id.toString() !== productId);
            }
        } else {
            return res.status(404).json({ msg: "Product not found in cart" });
        }

        await currUser.save();
        res.status(200).json({ msg: "Cart updated successfully" });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ msg: "Error updating cart quantity", error: error.message });
    }
});

router.post('/transfer', async (req, res) => {
    const { cart } = req.body;
  
    try {
        const currUser = await User.findById(findUser(req));
        for (const item of cart) {
            const existingProduct = currUser.cart.find(cartItem => cartItem._id.toString() === item.productID);
    
            if(existingProduct) {
                // If the product already exists in the cart, increase its quantity
                existingProduct.quantity += item.quantity;
            } else {
                // Otherwise, add the product with its quantity
                currUser.cart.push({ _id: item.productID, quantity: item.quantity });
            }
        }
  
        await currUser.save();
        res.status(200).json({ msg: 'Cart transferred successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Error transferring cart', error: error.message });
    }
});

module.exports = router;
