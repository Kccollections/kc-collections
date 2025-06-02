const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.render('user/product-list', { products });
    // res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    res.render('user/product-detail', { product });

    // res.send("product");
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product details' });
  }
};

