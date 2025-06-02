const express = require('express');
const paypalController = require('../controllers/paypalController');
const router = express.Router();
const { authenticate } = require('../middleware/auth.js');

router.post('/create-order', authenticate, paypalController.createOrder);
router.get('/capture-order', authenticate, paypalController.captureOrder);  // Use GET for the redirect flow
router.post('/refund-order/:orderId', authenticate, paypalController.refundOrder);
router.get('/user-orders', authenticate, paypalController.getUserOrders);

router.get('/checkout', authenticate, paypalController.renderCheckoutPage);
router.get('/payment-success', paypalController.renderPaymentSuccessPage);
router.get('/handle-success', paypalController.handlePaymentSuccess);

module.exports = router;