const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.js');
const Return = require('../models/Return');
const Order = require('../models/Order');
const ShiprocketService = require('./shiprocketService.js');
const nodemailer = require('nodemailer');

// Get all return requests (admin only)
router.get('/returns', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status) {
      filter.status = status;
    }
    
    const returns = await Return.find(filter)
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.productId'
        }
      })
      .populate('userId', 'name email')
      .populate('pickupAddress')
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
    res.render('admin/returns', { 
      returns, 
      selectedStatus: status || '',
      page: 'admin-returns' 
    });
  } catch (error) {
    console.error('Error fetching return requests:', error);
    res.status(500).render('error', { 
      message: 'Error fetching return requests', 
      error: { status: 500 } 
    });
  }
});

// Get return request details (admin only)
router.get('/returns/:returnId', authenticate, isAdmin, async (req, res) => {
  try {
    const returnId = req.params.returnId;
    
    const returnRequest = await Return.findById(returnId)
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.productId'
        }
      })
      .populate('userId', 'name email')
      .populate('pickupAddress')
      .populate('items.productId');
    
    if (!returnRequest) {
      return res.status(404).render('error', { 
        message: 'Return request not found', 
        error: { status: 404 } 
      });
    }
    
    res.render('admin/return-details', { 
      returnRequest, 
      page: 'admin-returns' 
    });
  } catch (error) {
    console.error('Error fetching return request details:', error);
    res.status(500).render('error', { 
      message: 'Error fetching return request details', 
      error: { status: 500 } 
    });
  }
});

// Update return request status (admin only)
router.post('/returns/:returnId/update', authenticate, isAdmin, async (req, res) => {
  try {
    const returnId = req.params.returnId;
    const { status, comments } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }
    
    const returnRequest = await Return.findById(returnId)
      .populate('userId', 'name email')
      .populate('orderId');
    
    if (!returnRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Return request not found' 
      });
    }
    
    // Update return request
    returnRequest.status = status;
    if (comments) {
      returnRequest.comments = comments;
    }
    
    // If status is approved, create return shipment
    if (status === 'Approved' && returnRequest.status !== 'Approved') {
      try {
        // Create return shipment in Shiprocket
        const shipmentData = await createReturnShipment(returnRequest);
        
        if (shipmentData && shipmentData.shipment_id) {
          returnRequest.trackingId = shipmentData.awb_code || null;
          
          // Send email to customer with return instructions
          sendReturnApprovalEmail(returnRequest);
        }
      } catch (shipmentError) {
        console.error('Error creating return shipment:', shipmentError);
        // Continue with the status update even if shipment creation fails
      }
    }
    
    // If status is completed, process refund
    if (status === 'Completed' && returnRequest.status !== 'Completed') {
      returnRequest.refundStatus = 'Processed';
      
      // Send refund confirmation email
      sendRefundProcessedEmail(returnRequest);
    }
    
    await returnRequest.save();
    
    res.json({ 
      success: true, 
      message: 'Return request updated successfully' 
    });
  } catch (error) {
    console.error('Error updating return request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating return request' 
    });
  }
});

// Process refund (admin only)
router.post('/returns/:returnId/refund', authenticate, isAdmin, async (req, res) => {
  try {
    const returnId = req.params.returnId;
    const { refundAmount } = req.body;
    
    if (!refundAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refund amount is required' 
      });
    }
    
    const returnRequest = await Return.findById(returnId)
      .populate('userId', 'name email');
    
    if (!returnRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Return request not found' 
      });
    }
    
    // Update refund details
    returnRequest.refundAmount = refundAmount;
    returnRequest.refundStatus = 'Completed';
    await returnRequest.save();
    
    // Send refund confirmation email
    sendRefundCompletedEmail(returnRequest);
    
    res.json({ 
      success: true, 
      message: 'Refund processed successfully' 
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing refund' 
    });
  }
});

// Helper function to create return shipment
const createReturnShipment = async (returnRequest) => {
  try {
    const order = await Order.findById(returnRequest.orderId._id);
    const pickupAddress = returnRequest.pickupAddress;
    
    // Create return shipment in Shiprocket
    const shipmentData = await ShiprocketService.createReturnShipment(
      returnRequest._id,
      {
        order_id: order._id.toString(),
        origin: {
          name: pickupAddress.name,
          address: pickupAddress.streetAddress,
          city: pickupAddress.city,
          state: pickupAddress.state,
          pin_code: pickupAddress.postalCode,
          country: pickupAddress.country,
          phoneNumber: pickupAddress.mobile,
        },
        items: returnRequest.items.map(item => ({
          id: item.productId._id.toString(),
          name: item.productId.name || `Product-${item.productId._id}`,
          sku: item.productId.sku || `SKU-${item.productId._id}`,
          quantity: item.quantity || 1,
          selling_price: item.productId.price || 0,
        })),
        sub_total: returnRequest.refundAmount,
      }
    );
    
    return shipmentData;
  } catch (error) {
    console.error('Error creating return shipment:', error);
    throw error;
  }
};

// Email functions
const sendReturnApprovalEmail = (returnRequest) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: returnRequest.userId.email,
    subject: `Return Request Approved - Return ID: ${returnRequest._id}`,
    html: `
      <h2>Your Return Request Has Been Approved</h2>
      <p>Dear ${returnRequest.userId.name},</p>
      <p>Your return request (ID: ${returnRequest._id}) has been approved. Here are the details:</p>
      <p><strong>Return Method:</strong> ${returnRequest.returnMethod}</p>
      <p><strong>Tracking ID:</strong> ${returnRequest.trackingId || 'Will be provided soon'}</p>
      <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount.toFixed(2)}</p>
      
      <h3>Return Instructions:</h3>
      ${returnRequest.returnMethod === 'Pickup' 
        ? `<p>Our courier partner will pick up your return from the address you provided. Please keep the items ready for pickup.</p>` 
        : `<p>Please drop off your return at the nearest drop-off location. Make sure to pack the items securely.</p>`
      }
      
      <p>If you have any questions, please contact our customer support.</p>
      <p>Thank you for shopping with KC Collection!</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending return approval email:', error);
    } else {
      console.log('Return approval email sent:', info.response);
    }
  });
};

const sendRefundProcessedEmail = (returnRequest) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: returnRequest.userId.email,
    subject: `Refund Processed - Return ID: ${returnRequest._id}`,
    html: `
      <h2>Your Refund Has Been Processed</h2>
      <p>Dear ${returnRequest.userId.name},</p>
      <p>We have processed your refund for return request (ID: ${returnRequest._id}).</p>
      <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount.toFixed(2)}</p>
      <p>The refund will be credited to your original payment method within 5-7 business days.</p>
      <p>Thank you for shopping with KC Collection!</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending refund processed email:', error);
    } else {
      console.log('Refund processed email sent:', info.response);
    }
  });
};

const sendRefundCompletedEmail = (returnRequest) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: returnRequest.userId.email,
    subject: `Refund Completed - Return ID: ${returnRequest._id}`,
    html: `
      <h2>Your Refund Has Been Completed</h2>
      <p>Dear ${returnRequest.userId.name},</p>
      <p>We have completed your refund for return request (ID: ${returnRequest._id}).</p>
      <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount.toFixed(2)}</p>
      <p>The refund has been credited to your original payment method.</p>
      <p>Thank you for shopping with KC Collection!</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending refund completed email:', error);
    } else {
      console.log('Refund completed email sent:', info.response);
    }
  });
};

module.exports = router;