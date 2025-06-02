// controllers/adminController.js
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Message = require('../models/contact')
const multer = require('multer');
const fs = require('fs');

exports.getDashboard = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const expenses = 2250;
    const totalOrders = await Order.countDocuments();
    const newInvoices = await Order.countDocuments({ paymentStatus: 'Pending' });

    const weeklySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = new Array(12).fill(0);
    monthlySales.forEach((sale) => {
      salesData[sale._id - 1] = sale.total;
    });

    const monthlyOrdersByCategory = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: {
            category: "$productDetails.category",
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const labelsWeekly = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesDataWeekly = new Array(7).fill(0);
    weeklySales.forEach((sale) => {
      salesDataWeekly[sale._id - 1] = sale.total;
    });

    const ordersByCategory = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          count: { $sum: 1 }
        }
      }
    ]);

    const categories = ordersByCategory.map(order => order._id);
    const orderCounts = ordersByCategory.map(order => order.count);

    const categoriesMonthly = [...new Set(monthlyOrdersByCategory.map(order => order._id.category))];
    const orderCountsMonthly = Array.from({ length: 12 }, () => new Array(categories.length).fill(0));

    monthlyOrdersByCategory.forEach((order) => {
      const monthIndex = order._id.month - 1;
      const categoryIndex = categories.indexOf(order._id.category);
      if (monthIndex >= 0 && categoryIndex >= 0) {
        orderCountsMonthly[monthIndex][categoryIndex] = order.count;
      }
    });

    res.render('admin/dashboard', {
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
      page: 'dashboard',
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};


// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    // res.json(users);
    res.render('admin/users', {users,page:"users"});
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
    res.render('admin/manage-products', { products: products,page:"products"});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
};


exports.createProduct = async (req, res) => {
  console.log("Creating product...");
  try {
    const { name, category, price,startingPrice, description,brand, stock, material, weight, dimensions, rating,attentionLevel,color } = req.body;

    const imagePaths = req.files['images']
      ? req.files['images'].map(file => `Product/${req.body.name}/${file.filename}`)
      : [];
    if (imagePaths.length < 1) {
      return res.status(400).send('You must upload at least 1 image.');
    }

    // Create new product with uploaded images
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
      images: imagePaths, // Ensure this matches the schema
    });

    // Save to the database
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
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

    // Handle image uploads if any
    const imagePaths = req.files['images']
      ? req.files['images'].map(file => `Product/${req.body.name}/${file.filename}`)
      : [];

    if (imagePaths.length > 0) {
      updatedData.images = imagePaths; // Add images to updatedData if provided
    }

    // Find the product by ID and update
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found in put route' });
    }

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

    // Remove associated image folder (optional)
    const folderPath = `public/Product/${deletedProduct.name}`;
    fs.rm(folderPath, { recursive: true, force: true }, err => {
      if (err) console.error('Error removing folder:', err);
    });

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

    res.render('admin/orders', { orders, groupedOrders, page: "orders" });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
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

    // Render the analytics page with all the data
    res.render('admin/charts1', {
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
      page: "analytics",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching analytics data' });
  }
};


exports.getMessages = async function(req, res, next) {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.render('admin/messages', { messages, page: "messages" });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
};
