const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Offer = require('../models/Offers');


router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      price, 
      brand, 
      material, 
      color, 
      rating, 
      page = 1, 
      limit = 9, 
      sort = 'featured' 
    } = req.query;

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

    // Calculate pagination values
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default: // 'featured' is the default
        sortOptions = { attentionLevel: -1 }; // High attention first
    }

    // Get the total count for pagination metadata
    const totalProducts = await Product.countDocuments(query);
    
    // Fetch filtered, sorted, and paginated products
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Fetch active offers and populate applicable products
    const activeOffers = await Offer.find({ isActive: true, validUntil: { $gte: new Date() } })
      .populate('applicableProducts');

    // Always return JSON for API requests with pagination metadata
    return res.status(200).json({ 
      products, 
      activeOffers,
      pagination: {
        total: totalProducts,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
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
      { 
        $project: { 
          _id: 0, 
          category: '$_id', 
          product: {
            _id: '$product._id',
            name: '$product.name',
            price: '$product.price',
            images: '$product.images', // Explicitly include images
            sale: '$product.sale',
            rating: '$product.rating'
          }
        } 
      }, // Format output
    ]);
    console.log('Categories with products fetched successfully');
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

  

// NEW ROUTES - Added before the generic /:productId route

// Route for featured products
router.get('/featured', async (req, res) => {
  try {
    // Extract limit from query parameters, default to 10 if not provided
    const limit = parseInt(req.query.limit) || 10;
    
    // Get products with high attention level or marked as featured
    const featuredProducts = await Product.find({ 
      $or: [
        { attentionLevel: 'High' },
        { featured: true }
      ]
    })
    .sort({ attentionLevel: -1, rating: -1 }) // Sort by attention level first, then by rating
    .limit(limit); // Apply the limit parameter

    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Error fetching featured products' });
  }
});


// Route for new arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    // Get products marked as new or sort by createdAt date
    const newArrivals = await Product.find({ 
      $or: [
        { isNew: true },
        { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Last 30 days
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(newArrivals);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ error: 'Error fetching new arrivals' });
  }
});

// Route for on-sale products
router.get('/on-sale', async (req, res) => {
  try {
    // Get products that are on sale
    const saleProducts = await Product.find({ sale: true });

    res.status(200).json(saleProducts);
  } catch (error) {
    console.error('Error fetching sale products:', error);
    res.status(500).json({ error: 'Error fetching sale products' });
  }
});

// Route for product categories
router.get('/categories', async (req, res) => {
  try {
    // Get distinct categories from products
    const categories = await Product.distinct('category');
    
    // Format the response with more details if needed
    const formattedCategories = categories.map(category => ({
      name: category,
      slug: category.toLowerCase().replace(/ /g, '-')
    }));

    res.status(200).json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// END OF NEW ROUTES

// Route to get product details
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Fetch related products (example: same category, limit 4)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id } // Exclude the current product
    }).limit(4);

    console.log(product);

    // For API requests, return JSON
    return res.status(200).json({ 
      product, 
      relatedProducts 
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Error fetching product details' });
  }
});

module.exports = router;
