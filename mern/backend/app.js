const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');



// Route imports
// We'll create these routes later
// Import routes
var authRoutes = require('./routes/authRoutes');
var profileRoutes = require('./routes/profileRoutes');
var adminRoutes = require('./routes/adminRoutes');
var wishlistRoutes = require('./routes/wishlistRoutes');
var orderRoutes = require('./routes/orderRoutes');
var productRoutes=require('./routes/productRoutes'); 
var cartRoutes = require('./routes/cartRoutes');  // Add this line
var reviewRoutes = require('./routes/reviewRoutes');  // Add this line
var indexRoutes = require('./routes/index');
var addressRoutes = require('./routes/addressRoutes'); //
var contactRoutes = require('./routes/contactRoutes'); //
var sliderRoutes = require('./routes/slider');
const offerRoutes = require('./routes/offerRoutes'); // Path to this routes file

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require('./config/db');
connectDB();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));

// Configure session before other middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/slider', sliderRoutes);
app.use('/api/offers', offerRoutes); // Add this line
app.use('/api/profile', profileRoutes);
app.use('/api', indexRoutes);
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));


// Root route
app.get('/', (req, res) => {
  res.send('KC Collection API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });
  
  // Global error handler
  app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        error: {
          message: 'Internal Server Error',
          detail: process.env.NODE_ENV === 'development' ? err.message : undefined
        }
      });
      
      // These lines should be inside the middleware function
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
  });
  
  // Set the port and start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
  
module.exports = app;