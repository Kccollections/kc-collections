// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const cartController = require('../../controllers/cartController');

// Ensure all cart routes are protected and accessible only to authenticated users
router.use(authenticate);

// Add item to cart
router.post('/add', cartController.addToCart);

// Get user's cart
router.get('/', cartController.getCart);

// Update cart item quantity
router.post('/update', cartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:productId', cartController.removeFromCart);

// Clear the entire cart
router.delete('/clear', cartController.clearCart);

module.exports = router;
