const express = require('express');
const razorpayController = require('../controllers/RazorpayController.js');
const router = express.Router();
const { authenticate } = require('../middleware/auth.js');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Product = require('../models/Product');
const user = require('../models/User');
const mongoose = require('mongoose');
const ShiprocketService = require('./shiprocketService.js');
const nodemailer = require('nodemailer');
const razorpay = require('../config/razorpayClient.js');
const OrderTemp = require('../models/OrderTemp');


// Route to fetch user orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const { year } = req.query;
    let filter = { userId: req.user.id };

    if (year) {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(filter)
      .populate('items.productId')
      .populate('address');

    // Get first and last order dates to generate year options
    const firstOrder = await Order.findOne({ userId: req.user.id }).sort({ createdAt: 1 });
    const lastOrder = await Order.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    let availableYears = [];
    if (firstOrder && lastOrder) {
      const startYear = new Date(firstOrder.createdAt).getFullYear();
      const endYear = new Date(lastOrder.createdAt).getFullYear();
      availableYears = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    }

    res.render('user/orders', { orders, page: 'orders', selectedYear: year || '', availableYears });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});




// router.post('/create-order', authenticate, async (req, res) => {
//   try {
//     const { items, totalAmount } = req.body;
//     if (!items || items.length === 0 || !totalAmount) {
//       return res.status(400).json({ error: 'Missing order details' });
//     }

//     const options = {
//       amount: totalAmount * 100,
//       currency: 'INR',
//       receipt: `order_rcptid_${Date.now()}`,
//       notes: { userId: req.user.id },
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     const tempOrder = new OrderTemp({
//       orderID: razorpayOrder.id,
//       items,
//       totalAmount,
//     });
//     await tempOrder.save();

//     res.json({ orderId: razorpayOrder.id });
//   } catch (error) {
//     console.error('Error initiating payment:', error);
//     res.status(500).json({ error: 'An error occurred while initiating payment. Please try again.' });
//   }
// });

// // Razorpay payment capture
// router.post('/capture-payment', authenticate, async (req, res) => {
//   try {
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//     if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
//       return res.status(400).json({ error: 'Invalid payment details' });
//     }

//     const crypto = require('crypto');
//     const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest('hex');

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({ error: 'Payment verification failed' });
//     }

//     const tempOrder = await OrderTemp.findOne({ orderID: razorpay_order_id });
//     if (!tempOrder) {
//       return res.status(404).json({ error: 'Temporary order not found' });
//     }

//     const newOrder = new Order({
//       userId: req.user.id,
//       items: tempOrder.items,
//       totalAmount: tempOrder.totalAmount,
//       paymentStatus: 'Paid',
//       paymentIntentId: razorpay_payment_id,
//       payment_method: 'ONLINE',
//     });

//     await newOrder.save();
//     await OrderTemp.deleteOne({ orderID: razorpay_order_id });

//     // Create shipment in Shiprocket
//     const shipmentData = await ShiprocketService.createShipment(newOrder);
//     if (shipmentData.success) {
//       newOrder.trackingId = shipmentData.tracking_id;
//       newOrder.trackingUrl = shipmentData.tracking_url;
//       newOrder.shipmentId = shipmentData.shipment_id;
//       newOrder.shippingStatus = 'Pending';
//       await newOrder.save();
//     }

//     res.json({ message: 'Payment successful!', order: newOrder });
//   } catch (error) {
//     console.error('Error capturing payment:', error);
//     res.status(500).json({ error: 'An error occurred while capturing payment. Please try again.' });
//   }
// });






// Create Razorpay Order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { items, totalAmount, addressId } = req.body;
    if (!items || items.length === 0 || !totalAmount || !addressId) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
      notes: { userId: req.user.id },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const tempOrder = new OrderTemp({
      orderID: razorpayOrder.id,
      items,
      totalAmount,
      addressId,
    });
    await tempOrder.save();

    res.json({ orderId: razorpayOrder.id });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ error: 'An error occurred while initiating payment. Please try again.' });
  }
});

// Capture Razorpay Payment
router.post('/capture-payment', authenticate, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }

    const crypto = require('crypto');
    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const tempOrder = await OrderTemp.findOne({ orderID: razorpay_order_id });
    if (!tempOrder) {
      return res.status(404).json({ error: 'Temporary order not found' });
    }

    const address = await Address.findById(tempOrder.addressId);
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address not found.' });
    }

    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5); // Estimated delivery in 5 days

    const newOrder = new Order({
      userId: req.user.id,
      items: tempOrder.items.map(item => ({
        productId: new mongoose.Types.ObjectId(item.id),
        quantity: item.quantity,
      })),
      totalAmount: tempOrder.totalAmount,
      address: tempOrder.addressId,
      paymentStatus: 'Paid',
      paymentIntentId: razorpay_payment_id,
      payment_method: 'ONLINE',
      shippingDate: new Date(),
      deliveryDate: estimatedDeliveryDate,
    });

    await newOrder.save();
    await OrderTemp.deleteOne({ orderID: razorpay_order_id });

    // Create shipment in Shiprocket
    const shipmentData = await ShiprocketService.createShipment(newOrder._id, {
      origin: {
        name: address.name,
        address: address.streetAddress,
        city: address.city,
        state: address.state,
        pin_code: address.postalCode,
        country: address.country,
        phoneNumber: address.mobile,
      },
      destination: {
        name: address.name,
        address: address.streetAddress,
        city: address.city,
        state: address.state,
        pin_code: address.postalCode,
        country: address.country,
        phoneNumber: address.mobile,
      },
      items: tempOrder.items.map(item => ({
        id: item.id,
        name: item.name || `Product-${item.id}`,
        sku: item.sku || `SKU-${item.id}`,
        quantity: item.quantity || 1,
        selling_price: item.price || 0,
      })),
      sub_total: tempOrder.totalAmount,
    });

    if (shipmentData.shipment_id) {
      const courierAssignment = await ShiprocketService.assignCourier(shipmentData.shipment_id);

      if (courierAssignment && courierAssignment.awb_code) {
        await Order.updateOne({ _id: newOrder._id }, {
          trackingId: courierAssignment.awb_code,
          trackingUrl: `https://shiprocket.co/tracking/${courierAssignment.awb_code}`,
          shipmentId: shipmentData.shipment_id,
          shippingStatus: 'Shipped'
        });
      }
    }

    res.json({ message: 'Payment successful!', order: newOrder });
  } catch (error) {
    console.error('Error capturing payment:', error);
    res.status(500).json({ error: 'An error occurred while capturing payment. Please try again.' });
  }
});








// Checkout page rendering
router.get('/checkout', async (req, res) => {
  try {
    const { addressId, totalProducts, totalAmount, productIds, productQuantities } = req.query;

    if (!addressId || !totalProducts || !totalAmount || !productIds || !productQuantities) {
      return res.status(400).send('Missing required parameters');
    }

    const address = await Address.findById(addressId);

    const products = JSON.parse(productIds).map(id => ({
      id,
      quantity: JSON.parse(productQuantities)[id],
    }));

    const productDetails = await Product.find({ _id: { $in: JSON.parse(productIds) } });
    const productsWithDetails = productDetails.map(product => ({
      name: product.name,
      id: product.id,
      price: product.price,
      quantity: products.find(p => p.id === product._id.toString()).quantity,
    }));

    res.render('user/checkout', {
      addressId,
      totalProducts,
      totalAmount: parseFloat(totalAmount),
      products: productsWithDetails,
      address,
      page: '',
    });
  } catch (error) {
    console.error('Error rendering checkout page:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Place COD order
router.post('/place-order-COD', authenticate, async (req, res) => {
  try {
    const { items, totalAmount, addressId } = req.body;
    
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items are required.' });
    }
    if (!totalAmount) {
      return res.status(400).json({ success: false, message: 'Total amount is required.' });
    }
    if (!addressId) {
      return res.status(400).json({ success: false, message: 'Address ID is required.' });
    }

    const userA = await user.findById(userId);
    if (!userA || !userA.addresses || userA.addresses.length === 0) {
      return res.status(404).json({ success: false, message: 'No addresses found for the user.' });
    }

    // const address = userA.addresses.find(a => a._id.toString() === addressId.trim());
    const address = await Address.findById(addressId);
    
    if (!address) {
      
      return res.status(400).json({ success: false, message: 'Address not found.' });
    }

    
    const addressid = address._id;

    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5); // Estimated delivery in 5 days


    const order = new Order({
      userId,
      items: items.map(item => ({
        productId: new mongoose.Types.ObjectId(item.id),
        quantity: item.quantity,
      })),
      totalAmount,
      address:addressid,
      payment_method: 'COD',
      shippingDate: new Date(), // Mark as shipped today
      deliveryDate: estimatedDeliveryDate, // Estimated delivery

    });

    await order.save();

    // Create shipment in Shiprocket
    const shipmentData = await ShiprocketService.createShipment(order._id, {
      origin: {
          // name: "vivek",
          // address: "bajwara",
          // city: "hoshiarpur",
          // state: "punjab",
          // pin_code: "146023",
          // country: "India",
          // phone: "7321835093",

          name: address.name,
          address: address.streetAddress,
          city: address.city,
          state: address.state,
          pin_code: address.postalCode,
          country: address.country,
          phoneNumber: address.mobile,
      },
      destination: {
          name: address.name,
          address: address.streetAddress,
          city: address.city,
          state: address.state,
          pin_code: address.postalCode,
          country: address.country,
          phoneNumber: address.mobile,
      },
      items: items.map(item => ({
        id: item.id, // Ensure `id` exists
        name: item.name || `Product-${item.id}`,
        sku: item.sku || `SKU-${item.id}`,
        quantity: item.quantity || 1,
        selling_price: item.price || 0,
    })),
      sub_total: totalAmount,
  });

  console.log("shipmentdata",shipmentData);
  
  if (shipmentData.shipment_id) {
    console.log("🚀 Shipment Created Successfully. Assigning Courier...");

    // Assign a courier
    const courierAssignment = await ShiprocketService.assignCourier(shipmentData.shipment_id);

    if (courierAssignment && courierAssignment.awb_code) {
        console.log("✅ Courier Assigned:", courierAssignment.courier_name);
        // order=await Order.findById(order._id);

        // order.trackingId = courierAssignment.awb_code;
        // order.trackingUrl = `https://shiprocket.co/tracking/${courierAssignment.awb_code}`;
        // order.shipmentId = shipmentData.shipment_id;
        // order.shippingStatus = 'Shipped';

        await Order.updateOne({ _id: order._id }, { 
          trackingId: courierAssignment.awb_code,
          trackingUrl: `https://shiprocket.co/tracking/${courierAssignment.awb_code}`,
          shipmentId: shipmentData.shipment_id,
          shippingStatus: 'Shipped'
      });
              
        console.log("✅ Order Updated with Tracking Details:", order);

    } else {
        console.log("❌ Failed to assign a courier. Please check Shiprocket dashboard.");
    }
}

    // sendOrderConfirmationEmail(order, userA, address);

    res.json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});






// Function to send email
const sendOrderConfirmationEmail = (order, user, address) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL, // Admin Email
      pass: process.env.ADMIN_PASSWORD, // Admin Email Password
    },
  });

  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL, // Send email to admin
    subject: `New Order Received - Order ID: ${order._id}`,
    html: `
      <h2>New Order Alert</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>User:</strong> ${user.name} (${user.email})</p>
      <p><strong>Address:</strong> ${address.streetAddress}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p><strong>Payment Method:</strong> COD</p>
      <h3>Items Ordered:</h3>
      <ul>
        ${order.items.map(item => `<li>${item.quantity} x Product ID: ${item.productId}</li>`).join('')}
      </ul>
      <p><strong>Tracking ID:</strong> ${order.trackingId || 'Not Available'}</p>
      <p><strong>Tracking URL:</strong> ${order.trackingUrl || 'Not Available'}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = router;