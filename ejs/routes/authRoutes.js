const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust the path to your User model
const { authenticate, authorizeAdmin } = require('../middleware/auth'); // Adjust path as needed

const otpStore = new Map();

// Login route
router.get('/login', function (req, res) {
  const error = req.query.error;
  res.render('auth/login', { page:'login', title: 'Login', error: error || null });
});


router.post('/login', async (req, res) => {
  const { identifier, password, otp, authMethod } = req.body;

  try {
    // Find the user by email or mobile
    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
    if (!user) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Invalid credentials. Please try again.'));
    }

    if (authMethod === 'otp') {
      const validOtp = otpStore.get(identifier);
      if (!validOtp || validOtp !== otp) {
        return res.redirect('/auth/login?error=' + encodeURIComponent('Invalid or expired OTP'));
      }
      otpStore.delete(identifier); // Clear OTP after use
    } else if (authMethod === 'password') {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.redirect('/auth/login?error=' + encodeURIComponent('Invalid credentials. Please try again.'));
      }
    } else {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Please specify a valid login method'));
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10h' });
    res.cookie('token', token, { httpOnly: true }).redirect(user.role === 'admin' ? '/admin/dashboard' : '/profile');
  } catch (error) {
    console.error('Login error:', error.message);
    return res.redirect('/auth/login?error=' + encodeURIComponent('Server error occurred. Please try again.'));
  }
});


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


router.get('/register', function(req, res) {
  res.render('auth/register', { title: 'Register' , page:'register' });
  });

// Registration (Signup) route
router.post('/register', async (req, res) => {
  const { name, email, mobile, password } = req.body;

  // Input validation
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the email or mobile number is already registered
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or mobile number already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ name, email, mobile, password: hashedPassword });
    await user.save();
    res.redirect('/');

    // res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Example routes with middleware
router.get('/admin', authenticate, authorizeAdmin, (req, res) => {
  res.send('Welcome, Admin!');
});

router.get('/user', authenticate, (req, res) => {
  res.send('Welcome, User!');
});

// Logout route (optional, just for user experience)
router.get('/logout', (req, res) => {
  // res.json({ message: 'Successfully logged out. Please remove the token from your client.' });
  res.clearCookie('token').redirect('/');
});

module.exports = router;  // Make sure you export only the router
