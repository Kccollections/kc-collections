// controllers/adminController.js
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Message = require('../models/contact');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary, storeFileLocally } = require('../config/cloudinary');

exports.getDashboard = async (req, res) => {
  try {
    // Fetch total sales
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Example static expenses, replace if necessary with dynamic calculations
    const expenses = 2250;

    // Fetch total orders
    const totalOrders = await Order.countDocuments();

    // Fetch new invoices (orders with paymentStatus = 'Pending')
    const newInvoices = await Order.countDocuments({ paymentStatus: 'Pending' });

    // Get inventory status - products with low stock (≤ 15) and out of stock (0)
    const lowStockCount = await Product.countDocuments({ stock: { $gt: 0, $lte: 15 } });
    const outOfStockCount = await Product.countDocuments({ stock: 0 });
    
    // Get actual low stock products with name, id, and stock count
    const lowStockProducts = await Product.find({ stock: { $gt: 0, $lte: 15 } })
      .select('_id name stock price')
      .limit(5)
      .sort({ stock: 1 });

    // Get actual out of stock products with name and id
    const outOfStockProducts = await Product.find({ stock: 0 })
      .select('_id name price')
      .limit(5);

    // Fetch weekly sales data
    const weeklySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } // Last 7 days
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // Group by day of the week
          total: { $sum: '$totalAmount' } // Sum of totalAmount for each day
        }
      },
      { $sort: { _id: 1 } } // Sort by day of the week
    ]);

    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          total: { $sum: '$totalAmount' } // Sum of totalAmount for each month
        }
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);

    // Map monthly sales data to an array of sales values for each month
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = new Array(12).fill(0);
    monthlySales.forEach((sale) => {
      salesData[sale._id - 1] = sale.total; // _id is 1 for January, 2 for February, etc.
    });

    // Fetch monthly orders by category
    const monthlyOrdersByCategory = await Order.aggregate([
      { $unwind: "$items" }, // Unwind the items array
      {
        $lookup: {
          from: "products", // Collection name for products
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }, // Unwind the productDetails array
      {
        $group: {
          _id: {
            category: "$productDetails.category", // Group by product category
            month: { $month: "$createdAt" } // Group by month
          },
          count: { $sum: 1 } // Count the number of orders for each category and month
        }
      },
      { $sort: { "_id.month": 1 } } // Sort by month
    ]);

    // Map weekly sales data to an array of sales values for each day of the week
    const labelsWeekly = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesDataWeekly = new Array(7).fill(0);
    weeklySales.forEach((sale) => {
      // Fix: Use salesDataWeekly instead of salesData
      salesDataWeekly[sale._id - 1] = sale.total; // _id is 1 for Sunday, 2 for Monday, etc.
    });

    // Fetch orders by category
    const ordersByCategory = await Order.aggregate([
      { $unwind: "$items" }, // Unwind the items array
      {
        $lookup: {
          from: "products", // Collection name for products
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }, // Unwind the productDetails array
      {
        $group: {
          _id: "$productDetails.category", // Group by product category
          count: { $sum: 1 } // Count the number of orders for each category
        }
      }
    ]);

    const categories = ordersByCategory.map(order => order._id);
    const orderCounts = ordersByCategory.map(order => order.count);

    const categoriesMonthly = [...new Set(monthlyOrdersByCategory.map(order => order._id.category))]; // Unique categories
    const orderCountsMonthly = Array.from({ length: 12 }, () => new Array(categories.length).fill(0)); // Initialize 12 months x categories matrix

    monthlyOrdersByCategory.forEach((order) => {
      const monthIndex = order._id.month - 1; // Month index (0 = January, 1 = February, etc.)
      const categoryIndex = categories.indexOf(order._id.category); // Category index
      if (categoryIndex !== -1) { // Only proceed if the category is found
        if (!orderCountsMonthly[monthIndex]) {
          orderCountsMonthly[monthIndex] = new Array(categories.length).fill(0);
        }
        orderCountsMonthly[monthIndex][categoryIndex] = order.count; // Fill the matrix
      }
    });

    console.log("all things", orderCounts,totalSales,expenses,totalOrders,salesData,labels,categories);

    // Since this is an API endpoint and not a view, return JSON instead of rendering
    return res.status(200).json({
      totalSales: totalSales[0]?.total || 0,
      expenses,
      totalOrders,
      newInvoices,
      salesData: JSON.stringify(salesData),
      labels: JSON.stringify(labels),
      categories: JSON.stringify(categories),
      orderCounts: JSON.stringify(orderCounts),
      categoriesMonthly: JSON.stringify(categoriesMonthly),
      orderCountsMonthly: JSON.stringify(orderCountsMonthly),
      salesDataWeekly: JSON.stringify(salesDataWeekly),
      labelsWeekly: JSON.stringify(labelsWeekly),
      products: {
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        lowStockItems: lowStockProducts,
        outOfStockItems: outOfStockProducts
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user role' });
  }
};

// Product Management
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    // Return JSON data instead of rendering a view
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
};


exports.createProduct = async (req, res) => {
  console.log("Creating product...");
  try {
    const { name, category, price, startingPrice, description, brand, stock, material, weight, dimensions, rating, attentionLevel, color } = req.body;

    // Check if files were uploaded
    if (!req.files || !req.files['images'] || req.files['images'].length < 1) {
      return res.status(400).json({ message: 'You must upload at least 1 image.' });
    }

    let imageUrls = [];
    let uploadError = null;

    // Try Cloudinary upload first
    try {
      console.log(`Attempting to upload ${req.files['images'].length} images to Cloudinary...`);
      
      // Process one image at a time to avoid overwhelming Cloudinary
      for (const file of req.files['images']) {
        try {
          const uploadResult = await uploadToCloudinary(file.path, `products/${name.replace(/\s+/g, '_')}`);
          imageUrls.push(uploadResult.url);
          console.log(`Successfully uploaded: ${uploadResult.url}`);
        } catch (singleUploadError) {
          console.error(`Failed to upload a single image: ${file.originalname}`, singleUploadError);
          // If any upload fails, set the error and break out of the loop
          uploadError = singleUploadError;
          break;
        }
      }
    } catch (error) {
      console.error('Error during Cloudinary upload attempt:', error);
      uploadError = error;
    }

    // If Cloudinary upload failed or was incomplete, use local storage as fallback
    if (uploadError || imageUrls.length < req.files['images'].length) {
      console.log('Using local storage fallback for images');
      imageUrls = []; // Reset URLs as we'll use local storage for all
      
      // Create directory if it doesn't exist
      const productDir = path.join(__dirname, '../public/Product', name.replace(/\s+/g, '_'));
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }
      
      // Process each image file
      for (const file of req.files['images']) {
        const localUrl = storeFileLocally(file.path, name);
        imageUrls.push(localUrl);
      }
      
      console.log(`Stored ${imageUrls.length} images locally`);
    }

    // Create new product with the image URLs (either from Cloudinary or local)
    const newProduct = new Product({
      name,
      category,
      price,
      startingPrice,
      description,
      brand,
      stock,
      material,
      weight,
      dimensions,
      rating,
      color,
      attentionLevel,
      images: imageUrls,
    });

    // Save to the database
    await newProduct.save();
    
    // Clean up temporary files
    req.files['images'].forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (e) {
        console.error(`Failed to delete temporary file ${file.path}:`, e);
      }
    });

    res.status(201).json({ 
      message: uploadError ? 'Product added successfully (using local storage)' : 'Product added successfully',
      product: newProduct 
    });
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    console.log('Request Params:', req.params);

    const { productId } = req.params;
    const updatedData = req.body;

    console.log('Updated Data:', updatedData);
    console.log('Product ID:', productId);

    // Find existing product to get current images
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found in put route' });
    }

    // Handle image uploads if any
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      let imageUrls = [];
      let uploadError = null;

      // Try Cloudinary upload first
      try {
        console.log(`Attempting to upload ${req.files['images'].length} images to Cloudinary...`);
        
        // Process one image at a time
        for (const file of req.files['images']) {
          try {
            const uploadResult = await uploadToCloudinary(file.path, `products/${updatedData.name.replace(/\s+/g, '_')}`);
            imageUrls.push(uploadResult.url);
            console.log(`Successfully uploaded: ${uploadResult.url}`);
          } catch (singleUploadError) {
            console.error(`Failed to upload a single image: ${file.originalname}`, singleUploadError);
            uploadError = singleUploadError;
            break;
          }
        }
      } catch (error) {
        console.error('Error during Cloudinary upload attempt:', error);
        uploadError = error;
      }

      // If Cloudinary upload failed or was incomplete, use local storage as fallback
      if (uploadError || imageUrls.length < req.files['images'].length) {
        console.log('Using local storage fallback for images');
        imageUrls = []; // Reset URLs as we'll use local storage for all
        
        const productDir = path.join(__dirname, '../public/Product', updatedData.name.replace(/\s+/g, '_'));
        if (!fs.existsSync(productDir)) {
          fs.mkdirSync(productDir, { recursive: true });
        }
        
        for (const file of req.files['images']) {
          const localUrl = storeFileLocally(file.path, updatedData.name);
          imageUrls.push(localUrl);
        }
        
        console.log(`Stored ${imageUrls.length} images locally`);
      }

      updatedData.images = imageUrls;
      
      // Clean up temporary files
      req.files['images'].forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (e) {
          console.error(`Failed to delete temporary file ${file.path}:`, e);
        }
      });
    } else {
      // If no new images were uploaded, keep existing images
      updatedData.images = existingProduct.images;
    }

    // Find the product by ID and update
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Correct parameter name

    // Find the product and delete it
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // No need to remove image folder, just clean up Cloudinary images
    // This assumes Cloudinary URLs contain the public_id which can be parsed
    try {
      const deletePromises = deletedProduct.images.map(imageUrl => {
        // Extract public_id from the Cloudinary URL
        const splitUrl = imageUrl.split('/');
        const filenameWithExt = splitUrl[splitUrl.length - 1];
        const filename = filenameWithExt.split('.')[0];
        const folderPath = splitUrl[splitUrl.length - 2];
        const public_id = `${folderPath}/${filename}`;
        
        return deleteFromCloudinary(public_id);
      });
      
      await Promise.all(deletePromises);
      console.log('Successfully deleted images from Cloudinary');
    } catch (cloudinaryErr) {
      console.error('Error deleting images from Cloudinary:', cloudinaryErr);
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};





exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId')
      .populate('address')
      .populate('items.productId')
      .exec();

    // Log to check if productId is populated correctly
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!item.productId) {
          console.log(`Product not found for order item: ${item._id}`);
        }
      });
    });

    const groupedOrders = {
      all: orders,
      paid: orders.filter(order => order.paymentStatus === 'Paid'),
      pending: orders.filter(order => order.paymentStatus === 'Pending'),
      cancelled: orders.filter(order => order.paymentStatus === 'Cancelled')
    };

    // Send JSON response instead of rendering view
    res.json(groupedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
    console.log(order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order status' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting order' });
  }
};

// Analytics Data
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Total Sales
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // 2. Top Products (by category or product)
    const topProducts = await Product.aggregate([
      { $sortByCount: '$category' } // Sort by category count
    ]);

    // 3. Loyalty Users
    const loyaltyUsers = await User.find().countDocuments();

    // 4. Weekly Sales
    const weeklySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } // Last 7 days
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // Group by day of the week (1 = Sunday, 2 = Monday, etc.)
          total: { $sum: '$totalAmount' } // Sum of totalAmount for each day
        }
      },
      { $sort: { _id: 1 } } // Sort by day of the week
    ]);

    // Map weekly sales data to an array of sales values for each day of the week
    const weeklyLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklySalesData = new Array(7).fill(0);
    weeklySales.forEach((sale) => {
      weeklySalesData[sale._id - 1] = sale.total; // _id is 1 for Sunday, 2 for Monday, etc.
    });

    // 5. Monthly Sales
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          total: { $sum: '$totalAmount' } // Sum of totalAmount for each month
        }
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);

    // Map monthly sales data to an array of sales values for each month
    const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySalesData = new Array(12).fill(0);
    monthlySales.forEach((sale) => {
      monthlySalesData[sale._id - 1] = sale.total; // _id is 1 for January, 2 for February, etc.
    });

    // 6. Orders by Category
    const ordersByCategory = await Order.aggregate([
      { $unwind: "$items" }, // Unwind the items array
      {
        $lookup: {
          from: "products", // Collection name for products
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }, // Unwind the productDetails array
      {
        $group: {
          _id: "$productDetails.category", // Group by product category
          count: { $sum: 1 } // Count the number of orders for each category
        }
      }
    ]);

    const categories = ordersByCategory.map(order => order._id);
    const orderCounts = ordersByCategory.map(order => order.count);

    // 7. New Orders (Pending Orders)
    const newOrders = await Order.countDocuments({ paymentStatus: 'Pending' });

    // 8. Total Orders
    const totalOrders = await Order.countDocuments();

    // 9. Average Order Value
    const averageOrderValue = totalSales[0]?.total / totalOrders || 0;

    // 10. Customer Retention Rate (if applicable)
    const returningCustomers = await Order.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }, // Customers with more than 1 order
      { $count: "returningCustomers" }
    ]);
    const totalCustomers = await Order.distinct("userId").countDocuments();
    const retentionRate = (returningCustomers[0]?.returningCustomers / totalCustomers) * 100 || 0;

    // 11. Most Active Users (if applicable)
    const mostActiveUsers = await Order.aggregate([
      { $group: { _id: "$userId", totalOrders: { $sum: 1 } } },
      { $sort: { totalOrders: -1 } }, // Sort by total orders in descending order
      { $limit: 5 }, // Top 5 most active users
      {
        $lookup: {
          from: "users", // Collection name for users
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" }, // Unwind the userDetails array
      {
        $project: {
          userId: "$_id",
          totalOrders: 1,
          userName: "$userDetails.name", // Include user name
          email: "$userDetails.email" // Include user email
        }
      }
    ]);

    // Return JSON data for analytics
    return res.status(200).json({
      totalSales: totalSales[0]?.total || 0,
      topProducts,
      loyaltyUsers,
      weeklyLabels: JSON.stringify(weeklyLabels),
      weeklySalesData: JSON.stringify(weeklySalesData),
      monthlyLabels: JSON.stringify(monthlyLabels),
      monthlySalesData: JSON.stringify(monthlySalesData),
      categories: JSON.stringify(categories),
      orderCounts: JSON.stringify(orderCounts),
      newOrders,
      totalOrders,
      averageOrderValue,
      retentionRate,
      mostActiveUsers,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching analytics data' });
  }
};

exports.getMessages = async function(req, res, next) {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    // Return JSON instead of rendering a view
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
};
