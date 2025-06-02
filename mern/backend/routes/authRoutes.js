const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust the path to your User model
const { authenticate, authorizeAdmin } = require('../middleware/auth'); // Adjust path as needed

const otpStore = new Map();

// Login route - API version for React frontend
router.post('/login', async (req, res) => {
  const { email, password, identifier, otp, authMethod } = req.body;

  try {
    // Find the user by email/mobile (support both email and identifier)
    const searchIdentifier = identifier || email;
    const user = await User.findOne({ $or: [{ email: searchIdentifier }, { mobile: searchIdentifier }] });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email/mobile or password' 
      });
    }

    if (authMethod === 'otp') {
      const validOtp = otpStore.get(searchIdentifier);
      if (!validOtp || validOtp !== otp) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired OTP' 
        });
      }
      otpStore.delete(searchIdentifier); // Clear OTP after use
    } else {
      // Default to password auth if not specified
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email/mobile or password' 
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10h' }
    );
    
    // Return user data and token as JSON for the React frontend
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during login' 
    });
  }
});

// Send OTP route (keep as is)
router.post('/send-otp', async (req, res) => {
  const { identifier } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Generate OTP and store in memory (or a database in production)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(identifier, otp);
    setTimeout(() => otpStore.delete(identifier), 10 * 60 * 1000); // OTP expires after 10 minutes

    // Simulate sending OTP via email or SMS (replace with actual implementation)
    console.log(`OTP sent to ${identifier}: ${otp}`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Registration route - API version for React frontend
router.post('/register', async (req, res) => {
  const { name, email, mobile, password } = req.body;

  // Input validation
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  try {
    // Check if the email or mobile number is already registered
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or mobile number already exists' 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ name, email, mobile, password: hashedPassword });
    await user.save();
    
    return res.status(201).json({ 
      success: true, 
      message: 'User registered successfully!' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during registration' 
    });
  }
});

// Example routes with middleware
router.get('/admin', authenticate, authorizeAdmin, (req, res) => {
  res.send('Welcome, Admin!');
});

router.get('/user', authenticate, (req, res) => {
  res.send('Welcome, User!');
});

// Logout route - API version
router.post('/logout', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Successfully logged out.' 
  });
});

module.exports = router;
