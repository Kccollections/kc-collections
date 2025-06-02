const razorpay = require('../config/razorpayClient');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const OrderTemp = require('../models/OrderTemp'); // Temporary model for s
const Product = require('../models/Product'); // Adjust the path as needed


exports.createOrder = async (req, res) => {
    try {
        
        const { items, totalAmount } = req.body;

        console.log(items, totalAmount)

        // Validate input
        if (!items || !Array.isArray(items) || items.length === 0) {
            
            return res.status(400).json({ error: 'Invalid or missing items array' });
        }

        
        items.forEach(item => {
            if (typeof item.price !== 'number' || item.price <= 0) {
                throw new Error(`Invalid price value in items: ${JSON.stringify(item)}`);
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                throw new Error(`Invalid quantity value in items: ${JSON.stringify(item)}`);
            }
        });
        

        // Create Razorpay order
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `order_rcptid_${Date.now()}`,
            notes: {
                userId: req.user.id, // Additional metadata
            },
        };
        
        const razorpayOrder = await razorpay.orders.create(options);

        // Save temporary order details
        const tempOrder = new OrderTemp({
            orderID: razorpayOrder.id,
            items,
            totalAmount,
        });
        await tempOrder.save();
        console.log(tempOrder);

        res.json({ orderId: razorpayOrder.id });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.capturePayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment details' });
        }

        // Verify Razorpay signature
        const isValid = razorpay.utils.verifyPaymentSignature({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        });

        if (!isValid) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        // Save order to database
        const tempOrder = await OrderTemp.findOne({ orderID: razorpay_order_id });
        if (!tempOrder) {
            return res.status(404).json({ error: 'Order not found in temporary storage' });
        }

        const newOrder = new Order({
            userId: req.user.id,
            items: tempOrder.items,
            totalAmount: tempOrder.totalAmount,
            status: 'Paid',
            paymentIntentId: razorpay_payment_id,
        });
        await newOrder.save();

        // Clean up temporary order
        await OrderTemp.deleteOne({ orderID: razorpay_order_id });

        res.json({ message: 'Payment successful!', order: newOrder });
    } catch (error) {
        console.error('Error capturing Razorpay payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.refundOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const refund = await razorpay.payments.refund(order.paymentIntentId, { amount: order.totalAmount * 100 });
        order.status = 'Refunded';
        await order.save();

        res.json({ message: 'Refund successful!', refund });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id });
        res.render('user/orders', { orders,page:'order'});
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
};


exports.renderPaymentSuccessPage = (req, res) => {
    res.render('payment-success', { message: 'Payment Successful!' });
};


exports.renderCheckoutPage = async (req, res) => {
    try {
        const totalProducts = parseInt(req.query.totalProducts); // Extract total products
        const totalAmount = parseFloat(req.query.totalAmount); // Extract total amount
        const productIds = JSON.parse(decodeURIComponent(req.query.productIds)); // Convert the string back to an array

        // Fetch products based on IDs
        const products = await Product.find({ _id: { $in: productIds } });

        console.log('Fetched Products:', products);
        console.log('Total Products:', totalProducts);
        console.log('Total Amount:', totalAmount);

        // Render the checkout page with data
        res.render('user/checkout', { products, totalProducts, totalAmount });
    } catch (error) {
        console.error('Error rendering checkout page:', error);
        res.status(500).send('Error loading checkout page');
    }
};

// Handle Razorpay payment success
exports.handlePaymentSuccess = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).send('Missing required Razorpay parameters');
        }

        // Verify the payment signature
        const crypto = require('crypto');
        const hash = crypto.createHmac('sha256', 'YOUR_RAZORPAY_SECRET_KEY')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (hash !== razorpay_signature) {
            return res.status(400).send('Invalid payment signature');
        }

        // Update the order status in your database
        const order = await Order.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { paymentStatus: 'Success', razorpayPaymentId: razorpay_payment_id },
            { new: true }
        );

        if (!order) {
            return res.status(404).send('Order not found');
        }

        console.log('Payment successful:', order);

        // Redirect to the payment success page
        res.redirect(`/payment-success?orderId=${order._id}`);
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).send('Error processing payment success');
    }
};

// Render the payment success page
exports.renderPaymentSuccessPage = async (req, res) => {
    try {
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).send('Order ID is required');
        }

        const order = await Order.findById(orderId).populate('items.product');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        console.log('Order details:', order);

        // Render the payment success page
        res.render('user/payment-success', { order });
    } catch (error) {
        console.error('Error rendering payment success page:', error);
        res.status(500).send('Error loading payment confirmation page');
    }
};
