var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const bodyParser = require('body-parser');
const session = require('express-session');

// Connect to MongoDB
const connectDB = require('../config/db');
connectDB();

// Import routes
var authRouter = require('./routes/authRoutes');
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



var app = express();

const cors = require('cors');
app.use(cors()); // Correct usage

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Use routes
app.use('/auth', authRouter);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/order', orderRoutes);
app.use('/', indexRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);  // Add this line
app.use('/review', reviewRoutes);  // Add this line
app.use('/address', addressRoutes); //
app.use('/contact', contactRoutes);
app.use('/slider', sliderRoutes);
app.use('/offers', offerRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// app.post('/cart/add', (req, res) => {
//   const { productId, quantity } = req.body;

//   // Initialize the cart if it doesn't exist
//   if (!req.session.cart) {
//     req.session.cart = {
//       items: [],
//       totalAmount: 0,
//     };
//   }
//   // Add product to cart
//   const product = { productId, quantity }; // Fetch actual product details from DB if needed
//   req.session.cart.items.push(product);

//   // Update total amount
//   req.session.cart.totalAmount += product.price * quantity;

//   res.redirect('/checkout');
// });



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



// Set the port and start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
