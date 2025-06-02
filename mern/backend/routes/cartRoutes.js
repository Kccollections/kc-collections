// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

// Ensure all cart routes are protected and accessible only to authenticated users
router.use(authenticate);

// Get user's cart - support both /:userId and / patterns
router.get('/:userId', cartController.getCart);
router.get('/', cartController.getCart);

// Add item to cart
router.post('/:userId', cartController.addToCart);
router.post('/add', cartController.addToCart);

// Update cart item quantity
router.put('/:userId/:productId', cartController.updateCartItem);
router.post('/update', cartController.updateCartItem);

// Remove item from cart
router.delete('/:userId/:productId', cartController.removeFromCart);
router.delete('/remove/:productId', cartController.removeFromCart);

// Clear the entire cart
router.delete('/:userId/clear', cartController.clearCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;
