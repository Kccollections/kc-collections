const jwt = require('jsonwebtoken');
// In your routes file (e.g., routes/shop.js)
const express = require('express');
const router = express.Router();
// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization'];
  
  // Debugging: confirm if token is present
  if (!token) {
    console.log('No token provided');
    // return res.status(403).json({ error: 'Access denied. No token provided.' })
    res.render('auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Invalid token:', error.message);
    // res.status(400).json({ error: 'Invalid token' });
    res.render('auth/login');
  }
};

// Role-based access control (admin only)
const authorizeAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Role-based access control (admin only)
const authorizeSupperAdmin = (req, res, next) => {
  if (req.user.role !== 'Supperadmin') {
    return res.status(403).json({ error: 'Access denied. SuperAdmins only.' });
  }
  next();
};


// user-based access
const authorizeUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Access denied. Users only.' });
  }
  next();
  };

// module.exports = { authenticate, authorizeAdmin };
module.exports = { authenticate, authorizeAdmin, authorizeSupperAdmin,authorizeUser };
