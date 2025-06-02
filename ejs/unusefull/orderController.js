const stripe = require('stripe')('sk_test_your_actual_api_key_here');
const schedule = require('node-schedule');
const Order = require('../models/Order'); // Assuming you have an Order model defined


exports.createCheckoutSession= async (req, res) => {
  const { items } = req.body;
  const YOUR_DOMAIN = 'http://localhost:4005';

  // Assuming you have Stripe set up and items in the correct format
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 2000,  
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    res.redirect(303, session.url);  // Redirect to the checkout page
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    console.error('Stripe error:', error);
    res.status(500).send('Internal Server Error');
  }
};



// Stripe Webhook for Payment Confirmation
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const order = new Order({
        userId: session.metadata.userId,
        items: JSON.parse(session.metadata.items),
        totalAmount: session.amount_total / 100,
        status: 'paid',
        paymentIntentId: session.payment_intent // Save paymentIntentId for refunds
      });
      await order.save();
      res.status(200).json({ received: true });
    }
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    console.error('Stripe error:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Place a new order
exports.placeOrder = async (req, res) => {
  const { items, totalAmount } = req.body;
  
  try {
    const order = new Order({
      userId: req.user.id,
      items,
      totalAmount
    });
    await order.save();
    res.json({ message: 'Order placed successfully!', order });
  } catch (error) {
    res.status(500).json({ error: 'Error placing order' });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    // Fetch orders for the logged-in user and populate product details
    const orders = await Order.find({ userId: req.user.id }).populate()
      .populate('items.productId'); // Populate productId inside items array

    console.log('Orders:', JSON.stringify(orders, null, 2)); // Debugging output

    res.render('user/order-history', { orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};



// Cancel an order with refund
exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'canceled') {
      return res.status(400).json({ error: 'Order is already canceled' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
    });

    order.status = 'canceled';
    await order.save();

    res.json({ message: 'Order canceled and refunded successfully!', order });
  } catch (error) {
    res.status(500).json({ error: 'Error canceling order' });
  }
};

// Process Return with Delayed Refund
exports.returnOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });

    if (!order || order.status !== 'delivered') {
      return res.status(400).json({ error: 'Order not found or not eligible for return' });
    }

    // Schedule refund after 24 hours
    schedule.scheduleJob(Date.now() + 24 * 60 * 60 * 1000, async () => {
      try {
        await stripe.refunds.create({
          payment_intent: order.paymentIntentId,
        });
        order.status = 'returned';
        await order.save();
      } catch (error) {
        console.error('Error processing delayed refund:', error);
      }
    });

    res.json({ message: 'Return processed, refund will be issued within 24 hours.' });
  } catch (error) {
    res.status(500).json({ error: 'Error processing return' });
  }
};