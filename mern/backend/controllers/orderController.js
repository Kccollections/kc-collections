const Address = require('../models/Address.js');
const Order = require('../models/Order.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');
const mongoose = require('mongoose');
const ShiprocketService = require('../routes/shiprocketService.js');
const nodemailer = require('nodemailer');
const razorpay = require('../config/razorpayClient.js');
const OrderTemp = require('../models/OrderTemp.js');
const crypto = require('crypto');

// Get user orders
const getMyOrders = async (req, res) => {
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

    // Return JSON data instead of rendering a view
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    // Find the order and populate related data (products and address)
    const order = await Order.findById(orderId)
      .populate('items.productId')
      .populate('address');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Make sure the user is authorized to view this order
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Error fetching order details' });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Make sure the user is authorized to cancel this order
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to cancel this order' });
    }
    
    // Check if the order is eligible for cancellation
    // Orders can be canceled only within 24 hours of placement and if not shipped yet
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursSincePlacement = (currentTime - orderTime) / (1000 * 60 * 60);
    
    const statusAllowsCancellation = 
      order.shippingStatus !== 'Shipped' && 
      order.shippingStatus !== 'Delivered';
    
    if (hoursSincePlacement > 24) {
      return res.status(400).json({ 
        success: false,
        message: 'This order cannot be cancelled as it has been more than 24 hours since placement.'
      });
    }
    
    if (!statusAllowsCancellation) {
      return res.status(400).json({ 
        success: false,
        message: 'This order cannot be cancelled as it has already been shipped or delivered.'
      });
    }
    
    // Update order status to cancelled
    order.shippingStatus = 'Cancelled';
    await order.save();
    
    // If there's a shipment, try to cancel it in Shiprocket too
    if (order.shipmentId) {
      try {
        // This is a placeholder. You would need to implement the cancel shipment functionality in ShiprocketService
        await ShiprocketService.cancelShipment(order.shipmentId);
        console.log('✅ Shipment cancelled in Shiprocket');
      } catch (shipmentError) {
        console.error('❌ Error cancelling shipment in Shiprocket:', shipmentError);
        // Continue with order cancellation even if Shiprocket cancellation fails
      }
    }
    
    // If this was an online payment, initiate refund (placeholder)
    if (order.payment_method !== 'COD' && order.paymentStatus === 'Paid') {
      // Initiate refund logic would go here
      // For now, just mark the order as refund initiated
      order.paymentStatus = 'Refund Initiated';
      await order.save();
    }
    
    // Send email notification about cancellation
    try {
      const user = await User.findById(req.user.id);
      await sendOrderCancellationEmail(order, user);
    } catch (emailError) {
      console.error('❌ Error sending cancellation email:', emailError);
      // Continue even if email fails
    }
    
    res.json({ success: true, message: 'Order has been cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: 'Error cancelling order' });
  }
};

// Create Razorpay Order
const createOrder = async (req, res) => {
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
};

// Capture Razorpay Payment
const capturePayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }

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

    // Get the user to send the invoice
    const user = await User.findById(req.user.id);
    if (user) {
      // Send order confirmation email with invoice
      try {
        await sendOrderConfirmationEmail(newOrder, user, address);
        console.log('✅ Order confirmation email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending order confirmation email:', emailError);
      }
    }

    res.json({ message: 'Payment successful!', order: newOrder });
  } catch (error) {
    console.error('Error capturing payment:', error);
    res.status(500).json({ error: 'An error occurred while capturing payment. Please try again.' });
  }
};

// Render checkout page
const renderCheckout = async (req, res) => {
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
};

// Place COD order
const placeCodOrder = async (req, res) => {
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

    const userA = await User.findById(userId);
    if (!userA || !userA.addresses || userA.addresses.length === 0) {
      return res.status(404).json({ success: false, message: 'No addresses found for the user.' });
    }

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
      address: addressid,
      payment_method: 'COD',
      shippingDate: new Date(), // Mark as shipped today
      deliveryDate: estimatedDeliveryDate, // Estimated delivery
    });

    // Save the order first
    await order.save();

    // Try to create shipment in Shiprocket, but don't let it block order creation
    let shipmentCreated = false;
    try {
      const shipmentData = await ShiprocketService.createShipment(order._id, {
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
        items: items.map(item => ({
          id: item.id, // Ensure `id` exists
          name: item.name || `Product-${item.id}`,
          sku: item.sku || `SKU-${item.id}`,
          quantity: item.quantity || 1,
          selling_price: item.price || 0,
        })),
        sub_total: totalAmount,
      });

      console.log("shipmentdata", shipmentData);
      
      if (shipmentData.shipment_id) {
        console.log("🚀 Shipment Created Successfully. Attempting to assign courier...");
        shipmentCreated = true;

        // Try to assign courier
        try {
          const courierAssignment = await ShiprocketService.assignCourier(shipmentData.shipment_id);

          if (courierAssignment && courierAssignment.awb_code) {
            console.log("✅ Courier Assigned:", courierAssignment.courier_name);
            await Order.updateOne({ _id: order._id }, { 
              trackingId: courierAssignment.awb_code,
              trackingUrl: `https://shiprocket.co/tracking/${courierAssignment.awb_code}`,
              shipmentId: shipmentData.shipment_id,
              shippingStatus: 'Shipped'
            });
                    
            console.log("✅ Order Updated with Tracking Details");
          } else {
            console.log("❌ Failed to assign a courier. Order created without courier details.");
          }
        } catch (courierError) {
          console.error("❌ Error assigning courier:", courierError);
          // Still mark the shipment as created with the shipment ID
          await Order.updateOne({ _id: order._id }, { 
            shipmentId: shipmentData.shipment_id,
            shippingStatus: 'Processing'
          });
        }
      }
    } catch (shipmentError) {
      // If shipping fails, just log it but still proceed with order creation
      console.error('❌ Error creating shipment:', shipmentError);
    }

    // Send order confirmation email with invoice
    try {
      await sendOrderConfirmationEmail(order, userA, address);
      console.log('✅ Order confirmation email with invoice sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email:', emailError);
    }

    // Return successful response
    res.json({ 
      success: true, 
      message: 'Order placed successfully!', 
      order,
      shipmentCreated
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Function to generate invoice HTML
const generateInvoiceHtml = async (order, user, address, products) => {
  // Format date for invoice
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  // Calculate total tax (assuming 18% GST)
  const taxRate = 0.18;
  const subtotal = order.totalAmount / (1 + taxRate);
  const tax = order.totalAmount - subtotal;
  
  // Generate invoice HTML
  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice for Order #${order._id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ddd;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .invoice-header img {
          max-height: 60px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f8f8f8;
        }
        .total-row {
          font-weight: bold;
        }
        .address-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .address-box {
          width: 48%;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div>
            <h1>INVOICE</h1>
            <p>KC Collection</p>
          </div>
          <div>
            <h3>Order #${order._id.toString().slice(-6).toUpperCase()}</h3>
            <p>Date: ${formatDate(order.createdAt || new Date())}</p>
          </div>
        </div>
        
        <div class="address-container">
          <div class="address-box">
            <h3>Billing & Shipping Address:</h3>
            <p>
              ${user.name}<br>
              ${address.streetAddress}<br>
              ${address.city}, ${address.state} ${address.postalCode}<br>
              ${address.country}<br>
              Phone: ${address.mobile}
            </p>
          </div>
          <div class="address-box">
            <h3>Payment Information:</h3>
            <p>
              <strong>Method:</strong> ${order.payment_method}<br>
              <strong>Status:</strong> ${order.paymentStatus || 'Pending'}<br>
              ${order.paymentIntentId ? `<strong>Transaction ID:</strong> ${order.paymentIntentId}<br>` : ''}
              <strong>Expected Delivery:</strong> ${formatDate(order.deliveryDate)}
            </p>
          </div>
        </div>
        
        <h3>Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(item => `
              <tr>
                <td>${item.name || `Product ID: ${item.id}`}</td>
                <td>${item.quantity}</td>
                <td>₹${(item.price).toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" style="text-align: right;">Subtotal:</td>
              <td>₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;">GST (18%):</td>
              <td>₹${tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Total:</td>
              <td>₹${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div>
          <h3>Shipping Information</h3>
          <p>
            <strong>Tracking ID:</strong> ${order.trackingId || 'Not Available Yet'}<br>
            ${order.trackingUrl ? `<strong>Tracking URL:</strong> <a href="${order.trackingUrl}">${order.trackingUrl}</a><br>` : ''}
            <strong>Shipping Status:</strong> ${order.shippingStatus || 'Processing'}
          </p>
        </div>
        
        <div class="footer">
          <p>Thank you for your order! If you have any questions, please contact our customer service.</p>
          <p>KC Collection | Email: support@kccollection.com | Phone: +91-XXXXXXXXXX</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return invoiceHtml;
};

// Function to send invoice to customer
const sendInvoiceEmail = async (order, user, address) => {
  try {
    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping invoice email.');
      return false;
    }
    
    // Fetch complete product details for the invoice
    const productIds = order.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Map products with quantities for the invoice
    const productsWithQuantity = order.items.map(item => {
      const productDetail = products.find(p => p._id.toString() === item.productId.toString());
      return {
        id: productDetail._id,
        name: productDetail.name,
        price: productDetail.price,
        quantity: item.quantity
      };
    });
    
    // Generate invoice HTML
    const invoiceHtml = await generateInvoiceHtml(order, user, address, productsWithQuantity);
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    

    // Setup email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Invoice for Order #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Dear ${user.name},</p>
        <p>We are pleased to confirm that your order has been received and is being processed. Please find your invoice attached below.</p>
        <p>Order ID: ${order._id}</p>
        <p>Total Amount: ₹${order.totalAmount}</p>
        <p>If you have any questions about your order, please reply to this email or contact our customer support.</p>
        <p>Best regards,</p>
        <p>KC Collection Team</p>
      `,
      attachments: [
        {
          filename: `Invoice-${order._id}.html`,
          content: invoiceHtml,
          contentType: 'text/html'
        }
      ]
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent to customer:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    return false;
  }
};

// Function to send email
const sendOrderConfirmationEmail = async (order, user, address) => {
  try {
    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping order confirmation email.');
      return false;
    }

    // First send invoice to customer
    await sendInvoiceEmail(order, user, address);
    
    // Then send notification to admin
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to the same email for admin notifications
      subject: `New Order Received - Order ID: ${order._id}`,
      html: `
        <h2>New Order Alert</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Address:</strong> ${address.streetAddress}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        <h3>Items Ordered:</h3>
        <ul>
          ${order.items.map(item => `<li>${item.quantity} x Product ID: ${item.productId}</li>`).join('')}
        </ul>
        <p><strong>Tracking ID:</strong> ${order.trackingId || 'Not Available'}</p>
        <p><strong>Tracking URL:</strong> ${order.trackingUrl || 'Not Available'}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to admin:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending email to admin:', error);
    return false;
  }
};

// Function to send order cancellation notification
const sendOrderCancellationEmail = async (order, user) => {
  try {
    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping cancellation email.');
      return false;
    }
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Send email to customer
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled`,
      html: `
        <h2>Order Cancellation Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>Your order has been successfully cancelled as requested.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Cancelled Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p>If you paid online, a refund will be initiated within 5-7 business days.</p>
        <p>If you have any questions about the cancellation or refund process, please contact our customer support.</p>
        <p>Best regards,</p>
        <p>KC Collection Team</p>
      `
    };
    
    await transporter.sendMail(customerMailOptions);
    
    // Send notification to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to the same email for admin notifications
      subject: `Order Cancelled - Order ID: ${order._id}`,
      html: `
        <h2>Order Cancellation Alert</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        <p>Please process any necessary refunds if payment was made online.</p>
      `,
    };
    
    await transporter.sendMail(adminMailOptions);
    console.log('✅ Cancellation emails sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    return false;
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  createOrder,
  capturePayment,
  renderCheckout,
  placeCodOrder,
  sendOrderConfirmationEmail,
  sendInvoiceEmail,
  cancelOrder,
  sendOrderCancellationEmail
};