const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.js');
const Order = require('../models/Order');
const Return = require('../models/Return');
const Product = require('../models/Product');
const Address = require('../models/Address');
const mongoose = require('mongoose');
const ShiprocketService = require('./shiprocketService.js');
const nodemailer = require('nodemailer');

// Get return policy page
router.get('/policy', (req, res) => {
  res.render('user/return-policy', { page: 'return-policy' });
});

// Get return request form
router.get('/request/:orderId', authenticate, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Check if order exists and belongs to the user
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.user.id 
    }).populate('items.productId').populate('address');
    
    if (!order) {
      return res.status(404).render('error', { 
        message: 'Order not found', 
        error: { status: 404 } 
      });
    }
    
    // Check if order is eligible for return (within 7 days of delivery)
    const currentDate = new Date();
    const deliveryDate = order.deliveryDate || order.createdAt;
    const daysSinceDelivery = Math.floor((currentDate - deliveryDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceDelivery > 7) {
      return res.render('user/return-ineligible', { 
        order, 
        page: 'returns',
        reason: 'This order is not eligible for return as it has been more than 7 days since delivery.'
      });
    }
    
    // Check if return already exists for this order
    const existingReturn = await Return.findOne({ orderId: orderId });
    if (existingReturn) {
      return res.redirect(`/returns/status/${existingReturn._id}`);
    }
    
    // Get user addresses for pickup
    const addresses = await Address.find({ userId: req.user.id });
    
    res.render('user/return-request', { 
      order, 
      addresses, 
      page: 'returns' 
    });
  } catch (error) {
    console.error('Error fetching order for return:', error);
    res.status(500).render('error', { 
      message: 'Error processing return request', 
      error: { status: 500 } 
    });
  }
});

// Submit return request
router.post('/request', authenticate, async (req, res) => {
  try {
    const { 
      orderId, 
      items, 
      returnMethod, 
      pickupAddressId, 
      comments 
    } = req.body;
    
    // Validate request
    if (!orderId || !items || !returnMethod || !pickupAddressId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Parse items if they're sent as a string
    const returnItems = typeof items === 'string' ? JSON.parse(items) : items;
    
    // Check if any items are selected for return
    if (!returnItems || returnItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No items selected for return' 
      });
    }
    
    // Create return request
    const returnRequest = new Return({
      orderId: orderId,
      userId: req.user.id,
      items: returnItems,
      returnMethod: returnMethod,
      pickupAddress: pickupAddressId,
      comments: comments || ''
    });
    
    // Calculate refund amount based on returned items
    const order = await Order.findById(orderId).populate('items.productId');
    let refundAmount = 0;
    
    for (const returnItem of returnItems) {
      const orderItem = order.items.find(
        item => item.productId._id.toString() === returnItem.productId
      );
      
      if (orderItem) {
        refundAmount += orderItem.productId.price * returnItem.quantity;
      }
    }
    
    returnRequest.refundAmount = refundAmount;
    await returnRequest.save();
    
    // Send email notification to admin
    sendReturnRequestEmail(returnRequest, req.user, order);
    
    res.status(201).json({ 
      success: true, 
      message: 'Return request submitted successfully', 
      returnId: returnRequest._id 
    });
  } catch (error) {
    console.error('Error submitting return request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting return request' 
    });
  }
});

// Get return status
router.get('/status/:returnId', authenticate, async (req, res) => {
  try {
    const returnId = req.params.returnId;
    
    const returnRequest = await Return.findOne({ 
      _id: returnId, 
      userId: req.user.id 
    })
    .populate({
      path: 'orderId',
      populate: {
        path: 'items.productId'
      }
    })
    .populate('pickupAddress')
    .populate('items.productId');
    
    if (!returnRequest) {
      return res.status(404).render('error', { 
        message: 'Return request not found', 
        error: { status: 404 } 
      });
    }
    
    res.render('user/return-status', { 
      returnRequest, 
      page: 'returns' 
    });
  } catch (error) {
    console.error('Error fetching return status:', error);
    res.status(500).render('error', { 
      message: 'Error fetching return status', 
      error: { status: 500 } 
    });
  }
});

// Get all returns for user
router.get('/my-returns', authenticate, async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user.id })
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.productId'
        }
      })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
    res.render('user/returns', { 
      returns, 
      page: 'returns' 
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).render('error', { 
      message: 'Error fetching returns', 
      error: { status: 500 } 
    });
  }
});

// Cancel return request
router.post('/cancel/:returnId', authenticate, async (req, res) => {
  try {
    const returnId = req.params.returnId;
    
    const returnRequest = await Return.findOne({ 
      _id: returnId, 
      userId: req.user.id 
    });
    
    if (!returnRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Return request not found' 
      });
    }
    
    // Only allow cancellation if status is still pending
    if (returnRequest.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel return request that is already being processed' 
      });
    }
    
    await Return.deleteOne({ _id: returnId });
    
    res.json({ 
      success: true, 
      message: 'Return request cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling return request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling return request' 
    });
  }
});

// Function to send email notification for return request
const sendReturnRequestEmail = (returnRequest, user, order) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to admin email
    subject: `New Return Request - Return ID: ${returnRequest._id}`,
    html: `
      <h2>New Return Request</h2>
      <p><strong>Return ID:</strong> ${returnRequest._id}</p>
      <p><strong>Order ID:</strong> ${returnRequest.orderId}</p>
      <p><strong>User:</strong> ${user.name} (${user.email})</p>
      <p><strong>Return Method:</strong> ${returnRequest.returnMethod}</p>
      <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount.toFixed(2)}</p>
      <h3>Items for Return:</h3>
      <ul>
        ${returnRequest.items.map(item => `
          <li>
            Product ID: ${item.productId}
            <br>Quantity: ${item.quantity}
            <br>Reason: ${item.reason}
          </li>
        `).join('')}
      </ul>
      <p><strong>Comments:</strong> ${returnRequest.comments || 'No comments provided'}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending return request email:', error);
    } else {
      console.log('Return request email sent:', info.response);
    }
  });
};

module.exports = router;