var express = require('express');
var router = express.Router();
const User = require('../models/User.js');
const { authenticate, authorizeAdmin } = require('../middleware/auth.js'); // Adjust path as needed
const bcrypt = require('bcryptjs');
const Slider = require('../models/slider.js');
const Offer = require('../models/Offers.js'); // Path to the Offer model
const Product = require('../models/Product.js'); 
const Order = require('../models/Order.js');
const Cart = require('../models/Cart.js');


/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    // Fetch slider data from the database
    const slides = await Slider.find();

    const products = await Product.find().populate()

    // Render the index view and pass the slider data
    res.render('index', { slides , page: "index" , products });
  } catch (err) {
    console.error('Error fetching slider data:', err);
    next(err); // Pass error to the error handler
  }
});

router.get('/index',async function(req, res, next) {
  try {
    // // Fetch slider data from the database
    // const slides = await Slider.find();

    // // Render the index view and pass the slider data
    // res.render('index', { slides , page: "index"});
    res.redirect('/');
  } catch (err) {
    console.error('Error fetching slider data:', err);
    next(err); // Pass error to the error handler
  }
});

router.get('/user/account', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('user/account', { user,page:'account',page:'account' }); // Pass user as an object
  } catch (error) {
    res.status(500).send('Server Error');
  }
});


router.post('/user/account', authenticate, async (req, res) => {
  const { name, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Fetch the logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's name
    if (name) user.name = name;

    // Handle password change
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirm password do not match' });
      }

      // Hash and update the new password
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Save the updated user details
    await user.save();
    // res.json({ message: 'Profile updated successfully' });
    res.redirect('/user/account'); // Redirect to account page after successful update
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});


router.get('/help/orderDeliverInformation',  (req, res) => {
  res.render('help/orderDeliverInformation',{page:'orderDeliverInformation'});
});

router.get('/help/payments',  (req, res) => {
  res.render('help/payments',{page:'payments'});
});

router.get('/help/returns',  (req, res) => {
  res.render('help/returns',{page:'returns'});
});

router.get('/help/myAccount',  (req, res) => {
  res.render('help/myAccount',{page:'myAccount'});
});


router.get('/offer', async (req, res) => {
  try {
    const offers = await Offer.find().populate('applicableProducts'); // Populate applicableProducts
    res.render('user/offers', { page: 'offer', offers }); // Pass offers to the view
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving offers');
  }
});


  router.post('/offers/add', async (req, res) => {
    try {
      const {
        title,
        description,
        discountPercentage,
        validFrom,
        validUntil,
        applicableProducts,
        termsAndConditions,
      } = req.body;
  
      // Ensure `applicableProducts` is an array
      if (!Array.isArray(applicableProducts)) {
        return res.status(400).json({ error: 'applicableProducts must be an array' });
      }
  
      // Validate discountPercentage
      if (discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({ error: 'Discount percentage must be between 0 and 100.' });
      }
  
      // Apply discount to applicable products
      const updatePromises = applicableProducts.map(async (productId) => {
        const product = await Product.findById(productId);
        if (!product) {
          throw new Error(`Product with ID ${productId} not found.`);
        }
  
        const updatedPrice = product.startingPrice * (1 - discountPercentage / 100);
  
        return Product.findByIdAndUpdate(
          productId,
          {
            price: updatedPrice,
            sale: true,
          },
          { new: true }
        );
      });
  
      // Wait for all updates to complete
      await Promise.all(updatePromises);
  
      // Save the offer
      const newOffer = new Offer({
        title,
        description,
        discountPercentage,
        validFrom,
        validUntil,
        applicableProducts,
        termsAndConditions,
      });
      await newOffer.save();
  
      res.status(201).json({ message: 'Offer added and products updated successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

















//   router.get('/order-details/:id', async (req, res) => {
//     try {
//         const order = await Order.findById(req.params.id)
//             .populate('userId', 'name email') // Populate user details (e.g., name and email)
//             .populate({
//                 path: 'items.productId',
//                 select: 'name price', // Populate product details (e.g., name and price)
//             })
//             .populate('address'); // Populate address details

//         if (!order) {
//             return res.status(404).send('Order not found');
//         }

//         console.log(order);
//         res.render('user/order-details', { order, page: 'order-details' }); // Render order details page
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server Error');
//     }
// });




router.get('/order-details/:id', async (req, res) => {
  try {
      res.set('Cache-Control', 'no-store'); // Disable caching
      const orders = await Order.findById(req.params.id).populate()
          .populate('userId', 'name email')
          .populate('items.productId')
          .populate('address');

      if (!orders) {
          return res.status(404).send('Order not found');
      }

      // Ensure all necessary data is populated
      if (!orders.userId || !orders.address || !orders.items.every(item => item.productId)) {
          return res.status(400).send('Order data is incomplete.');
      }

      // Calculate totals if not available
      const subtotal = orders.items.reduce((sum, item) => {
          return sum + item.productId.price * item.quantity;
      }, 0);

      const shippingCost = orders.shippingCost || 0;
      const discount = orders.discount || 0;
      const totalAmount = subtotal + shippingCost - discount;

      // Attach calculated fields to the order object
      orders.subtotal = subtotal;
      orders.shippingCost = shippingCost;
      orders.discount = discount;
      orders.totalAmount = totalAmount;
  
      console.log('Populated Order:', orders);
      res.render('user/order-details', { orders, page: 'order-details'});
  } catch (err) {
      console.error('Error fetching order details:', err.message);
      res.status(500).send('Server Error');
  }
});






// Route to view or download invoice
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Route to generate and download the invoice
router.get('/invoice/:id', async (req, res) => {
    try {
        // Fetch and populate the order details
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email') // Populate user details
            .populate('items.productId', 'name price') // Populate product details
            .populate('address'); // Populate address details

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Ensure the invoices directory exists
        const invoicesDir = path.join(__dirname, 'invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        // Create a new PDF document
        const doc = new PDFDocument();
        const fileName = `Invoice-${order._id}.pdf`;
        const filePath = path.join(invoicesDir, fileName);

        // Write PDF to a file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Generate the invoice content
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Order ID: ${order._id}`);
        doc.text(`Customer Name: ${order.userId.name}`);
        doc.text(`Email: ${order.userId.email}`);
        doc.text(`Order Date: ${order.createdAt.toDateString()}`);
        doc.text(`Payment Status: ${order.paymentStatus}`);
        doc.text(`Order Type: ${order.payment_method}`);
        doc.moveDown();
        doc.text('Shipping Address:');
        doc.text(`${order.address.name}`);
        doc.text(`${order.address.streetAddress}`);
        doc.text(`${order.address.city}, ${order.address.state}, ${order.address.postalCode}`);
        doc.text(`${order.address.country}`);
        doc.text(`Mobile: ${order.address.mobile}`);
        doc.moveDown();
        doc.text('Items:');
        order.items.forEach((item, index) => {
            doc.text(
                `${index + 1}. ${item.productId.name} - $${item.productId.price} x ${item.quantity}`
            );
        });
        doc.moveDown();
        doc.fontSize(16).text(`Total Amount: $${order.totalAmount}`, { align: 'right' });

        doc.end();

        // Wait for the PDF to finish writing
        writeStream.on('finish', () => {
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error sending invoice:', err);
                    return res.status(500).send('Error downloading invoice');
                }
                // Optionally, delete the file after sending
                fs.unlinkSync(filePath);
            });
        });

        writeStream.on('error', (err) => {
            console.error('Error writing PDF file:', err);
            res.status(500).send('Error creating invoice');
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




// Route to buy items again (add to cart)
router.get('/cart/add/:id', authenticate, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        

        // Add items from the order to the user's cart
        const cart = await Cart.findOne({ user: req.user._id }); // Assuming you have a user model
        console.log(cart)
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

       

        order.items.forEach(item => {
            cart.items.push({
                productId: item.productId,
                quantity: item.quantity
            });
        });

        await cart.save();

        // Redirect to the cart page or show a success message
        res.redirect('/cart');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
  
  
module.exports = router;
