const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.js');
const orderController = require('../controllers/orderController.js');
const razorpayController = require('../controllers/RazorpayController.js');


// Route to fetch user orders
router.get('/my-orders', authenticate, orderController.getMyOrders);

// Route to fetch a single order by ID
router.get('/:id', authenticate, orderController.getOrderById);

// Cancel order
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

// Create Razorpay Order
router.post('/create-order', authenticate, orderController.createOrder);

// Capture Razorpay Payment
router.post('/capture-payment', authenticate, orderController.capturePayment);

// Checkout page rendering
router.get('/checkout', orderController.renderCheckout);

// Place COD order
router.post('/place-order-COD', authenticate, orderController.placeCodOrder);

// Email functionality moved to controller

module.exports = router;