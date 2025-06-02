const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Offer = require('../models/Offers');


router.get('/', async (req, res) => {
  try {
    const { search, category, price, brand, material, color, rating } = req.query;

    // Build query object for MongoDB
    const query = {};

    // Search functionality: search by product name and category
    if (search) {
      const normalizedSearch = search.toLowerCase(); // Convert the search term to lowercase
      query.$or = [
          { name: { $regex: normalizedSearch, $options: 'i' } },  // Case-insensitive search by name
          { category: { $regex: normalizedSearch, $options: 'i' } }  // Case-insensitive search by category
      ];
  }

    // Additional filters
    if (category) query.category = { $in: category.split(',') };

    if (price) {
      const [minPrice, maxPrice] = price.split('-').map(Number);
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (brand) query.brand = { $in: brand.split(',') };

    if (material) query.material = { $in: material.split(',') };

    if (color) query.color = { $in: color.split(',') };

    if (rating) query.rating = { $gte: Number(rating) };

    // Fetch filtered products
    const products = await Product.find(query);

    // Fetch active offers and populate applicable products
    const activeOffers = await Offer.find({ isActive: true, validUntil: { $gte: new Date() } })
      .populate('applicableProducts');

    // If AJAX request, return only the product data
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(200).json({ products });
    }

    // Render full page for regular requests
    res.render('user/shop', { products, activeOffers, page: "shop" });
  } catch (error) {
    console.error("Error fetching products or offers:", error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});
  




router.get('/categories-with-products', async (req, res) => {
  try {
    const categoriesWithProducts = await Product.aggregate([
      {
        $group: {
          _id: '$category', // Group by category
          product: { $first: '$$ROOT' }, // Get the first product in each category
        },
      },
      { $project: { _id: 0, category: '$_id', product: '$product' } }, // Format output
    ]);
    res.json(categoriesWithProducts);
  } catch (error) {
    console.error('Error fetching categories with products:', error);
    res.status(500).json({ error: 'Failed to fetch categories with products' });
  }
});


  router.post('/filter-products', async (req, res) => {
    const { 
      categories = [], 
      brands = [], 
      materials = [], 
      colors = [], 
      price, 
      ratings = [], 
      sort = 'default', 
      sale = false, 
      search = '' 
    } = req.body;

    try {
        // Step 1: Fetch products based on search term (if any)
        let query = {};

if (search) {
    const normalizedSearch = search.toLowerCase(); // Convert the search term to lowercase
    query.$or = [
        { name: { $regex: normalizedSearch, $options: 'i' } },  // Case-insensitive search by name
        { category: { $regex: normalizedSearch, $options: 'i' } }  // Case-insensitive search by category
    ];
}

        let filteredProducts = await Product.find(query);

        // Step 2: Apply filters on the products returned by the search query
        if (categories.length) {
            filteredProducts = filteredProducts.filter(product => categories.includes(product.category));
        }

        if (brands.length) {
            filteredProducts = filteredProducts.filter(product => brands.includes(product.brand));
        }

        if (materials.length) {
            filteredProducts = filteredProducts.filter(product => materials.includes(product.material));
        }

        if (colors.length) {
            filteredProducts = filteredProducts.filter(product => colors.includes(product.color));
        }

        if (price) {
            filteredProducts = filteredProducts.filter(product => product.price <= price);
        }

        if (ratings.length) {
            filteredProducts = filteredProducts.filter(product => ratings.includes(product.rating));
        }

        if (sale) {
            filteredProducts = filteredProducts.filter(product => product.isOnSale === true);
        }

        // Step 3: Apply sorting
        if (sort === 'popularity') {
            filteredProducts = filteredProducts.sort((a, b) => b.popularity - a.popularity);
        } else if (sort === 'price-low') {
            filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-high') {
            filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
        }

        // Send filtered products back
        res.json(filteredProducts);
    } catch (error) {
        console.error("Error filtering products:", error);
        res.status(500).json({ error: 'An error occurred while filtering products' });
    }
});

  




// Route to get product details
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    product.images.forEach(element => {
      console.log(element);
    });

    // Fetch related products (example: same category, limit 4)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id } // Exclude the current product
    }).limit(4);

    res.render('user/product-detail', { 
      product: { 
        ...product.toObject(), 
        thumbnailImages: product.images || [], 
        reviews: product.reviews || [], 
        specifications: product.specifications || {}
      }, 
      relatedProducts, // Ensure relatedProducts is passed
      page: "product" 
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Error fetching product details' });
  }
});
  

module.exports = router;
