const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getSalesData = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const productData = await Product.aggregate([{ $sortByCount: '$category' }]);
    res.json({ totalSales, productData });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};