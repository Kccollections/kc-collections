// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const Product= require('../models/Product');
const Order= require('../models/Order');
const Message= require('../models/contact');

const fs = require('fs');
const path = require('path'); // Import the path module
const multer = require('multer');

// Ensure all admin routes are protected with admin authentication and authorization
router.use(authenticate, authorizeAdmin);

// Admin dashboard
router.get('/dashboard', adminController.getDashboard);

// User management routes
router.get('/users', adminController.getAllUsers);
router.delete('/user/:userId', adminController.deleteUser);
router.put('/user/:userId', adminController.updateUserRole);

// Product management routes
router.get('/products', adminController.getAllProducts);

// Create temporary uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set storage engine for multer - temporary storage before Cloudinary upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
  
// Initialize multer for multiple file uploads
const upload = multer({
    storage: storage,
    limits: { fileSize: 12 * 1024 * 1024 }, // Limit: 12MB per file
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Only images (jpg, jpeg, png) and PDFs are allowed!');
        }
    }
});
  
// Use upload.fields to handle images
const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 }, // Allow up to 10 images
]);

// Define the route for creating a product
router.post('/product/new', uploadFields, adminController.createProduct);

router.put('/product/:productId',uploadFields, adminController.updateProduct);
router.get('/product/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in get route' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });


router.delete('/product/:productId/delete', adminController.deleteProduct);

// Order management routes
router.get('/orders', adminController.getAllOrders);


router.get('/order/:id', async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('items.productId', 'name price')
        .populate('address', 'street city state zip');
      if (!order) {
        return res.status(404).send({ message: 'Order not found' });
      }
      res.status(200).send(order);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Server error' });
    }
  });
router.put('/order/:orderId', adminController.updateOrderStatus);
router.delete('/order/:orderId', adminController.deleteOrder);

// Analytics route
router.get('/analytics', adminController.getAnalytics);
// router.get('/analitics', (req, res) => {
//     // Assuming you have the following data from your database or business logic
//     const userData = 500;  // Example data
//     const productData = 100;  // Example data
//     const activeOrders = 30;  // Example data
//     const canceledOrders = 5;  // Example data
//     const shippedOrders = 25;  // Example data
  
//     // Render the dashboard and pass the data to the template
//     res.render('admin/charts', {
//       userData,
//       productData,
//       activeOrders,
//       canceledOrders,
//       shippedOrders,
//       page: 'analytics',
//     });
//   });
  



router.get('/messages', adminController.getMessages);





module.exports = router;
