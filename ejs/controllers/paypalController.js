const { client } = require('../paypalClient');
const paypal = require('@paypal/checkout-server-sdk');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const OrderTemp = require('../models/OrderTemp'); // Temporary model for storing orders

exports.createOrder = async (req, res) => {
    try {
        const { items } = req.body;

        // Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid or missing items array' });
        }

        // Validate each item's price and quantity
        items.forEach(item => {
            if (typeof item.price !== 'number' || item.price <= 0) {
                throw new Error(`Invalid price value in items: ${JSON.stringify(item)}`);
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                throw new Error(`Invalid quantity value in items: ${JSON.stringify(item)}`);
            }
        });

        // Calculate total amount for items
        const totalAmount = items
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2);

        console.log("Total amount for order:", totalAmount);

        // Calculate item totals for breakdown
        const itemBreakdown = items.map(item => ({
            name: item.name,
            unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
            amount: {
                currency_code: 'USD',
                value: (item.price * item.quantity).toFixed(2), // Item total
            }
        }));

        // Create PayPal order request
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: totalAmount,
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: totalAmount,
                            },
                        },
                    },
                    items: itemBreakdown,
                },
            ],
            application_context: {
                return_url: `http://localhost:4005/paypal/handle-success`,
                cancel_url: `http://localhost:4005/paypal/cancel`,
            },
        });

        // Execute the request
        const order = await client.execute(request);

        // Save order details temporarily
        const tempOrder = new OrderTemp({
            orderID: order.result.id,
            items,
            totalAmount,
        });
        await tempOrder.save();

        // Respond with approval URL
        res.json({ approval_url: order.result.links.find(link => link.rel === 'approve').href });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.captureOrder = async (req, res) => {
    const orderID = req.query.orderID; // Retrieve order ID from query string

    if (!orderID) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        const capture = await client.execute(request);

        // Ensure valid response from PayPal
        if (!capture || !capture.result || !capture.result.purchase_units || capture.result.purchase_units.length === 0) {
            return res.status(400).json({ error: 'Invalid order details from PayPal' });
        }

        const order = capture.result;
        // console.log("tempOrder", order);

        // Retrieve the captured amount
        const captures = order.purchase_units[0].payments.captures;
        const capturedAmount = captures[0].amount.value; // Extract numeric value


        // Retrieve items from temporary storage
        const tempOrder = await OrderTemp.findOne({ orderID });
        if (!tempOrder) {
            return res.status(404).json({ error: 'Order not found in temporary storage' });
        }

        if (!tempOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = tempOrder.items;
        console.log("items", items);

        const productId = items._id || items.productId; // Depending on how the product ID is stored in your item
            console.log("Product ID:", productId);

        // Save the final order in the database
        const newOrder = new Order({
            userId: req.user ? req.user.id : null, // Use authenticated user ID if available
            items,
            totalAmount: parseFloat(capturedAmount),
            status: 'paid',
            paymentIntentId: orderID, //
        });

        console.log("newOrder", newOrder);

        await newOrder.save();

        // Cleanup: Remove temp order
        await OrderTemp.deleteOne({ orderID });

        // Clear the user's cart after order creation
        const userCart = await Cart.findOne({ userId: req.user.id });
        if (userCart) {
            await Cart.deleteOne({ userId: req.user.id }); // Delete the user's cart
            console.log('Cart cleared after order creation');
        }
        
        await tempOrder.deleteOne({tempOrder});

        // Update product stock
        // const product = await Product.findById(productId);
        // if (product) {
        //     product.stock -= 1;
        //     await product.save();
        // } else {
        //     return res.status(404).json({ error: 'Product not found' });
        // }

        // Send email notification to admin
        // const email = new Email({
        //     to: 'your-admin-email@example.com',
        //     subject: 'New Order Received',
        //     text: `New order received from ${req.user ? req.user.name : 'Guest
        //     ' with order ID ${orderID}`,
        // });
        // await email.send();
        

        // Redirect to payment success page with the captured order
        res.redirect(`/paypal/payment-success?orderId=${newOrder._id}`);
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ error: 'Internal Server Error during payment capture' });
    }
};



exports.refundOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findOne({ _id: orderId, userId: req.user.id });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const captureId = order.paymentIntentId;
        const request = new paypal.payments.CapturesRefundRequest(captureId);
        request.requestBody({});

        const refund = await client.execute(request);
        order.status = 'canceled';
        await order.save();

        res.json({ message: 'Order refunded successfully!', order });
    } catch (error) {
        console.error('Error refunding payment:', error);
        res.status(500).json({ error: 'Error refunding order' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
};

const Product = require('../models/Product'); // Adjust the path to your Product model

exports.renderCheckoutPage = async (req, res) => {
    try {
        const totalProducts = parseInt(req.query.totalProducts); // Extract total products
        const totalAmount = parseFloat(req.query.totalAmount); // Extract total amount
        const productIds = JSON.parse(decodeURIComponent(req.query.productIds)); // Convert the string back to an array

        // Fetch products and populate if necessary
        const products = await Product.find({ _id: { $in: productIds } }); // Query for products with the given IDs

        // Log the fetched products for debugging
        console.log("Fetched Products:", products);
        console.log("Total Products:", totalProducts);
        console.log("Total Amount:", totalAmount);

        // Render the checkout page, passing products, totalAmount, and totalProducts
        res.render('user/checkout', { products, totalProducts, totalAmount });

    } catch (error) {
        console.error('Error rendering checkout page:', error);
        res.status(500).send('Error loading checkout page');
    }
};


exports.renderPaymentSuccessPage = async (req, res) => {
    try {
        const { orderId } = req.query;
        if (!orderId) {
            console.error('Missing orderId in query');
            return res.status(400).send('Order ID is required');
        }

        // Fetch order from database and populate product details
        const order = await Order.findById(orderId);
        const product = await order.items.id;
        console.log("product:", product);
        
        console.log('Manually Populated Order:', order);

        if (!order) {
            console.error('Order not found for ID:', order);
            return res.status(404).send('Order not found');
        }


        // Pass the order to the template
        res.render('user/payment-success', { order });
    } catch (error) {
        console.error('Error loading payment success page:', error);
        res.status(500).send('Error loading payment confirmation page');
    }
};





exports.handlePaymentSuccess = (req, res) => {
    const orderID = req.query.token || req.query.orderID; // Ensure the right query parameter is used

    if (!orderID) {
        return res.status(400).send('Missing order ID');
    }

    // Redirect to the capture endpoint with the orderID
    res.redirect(`/paypal/capture-order?orderID=${orderID}`);
};