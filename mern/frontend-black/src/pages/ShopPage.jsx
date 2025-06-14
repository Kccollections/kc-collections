import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';
import { getAllCategories } from '../services/realApi';
import { productsApi, wishlistApi } from '../services/realApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentSection, setCurrentSection] = useState('all-products');
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlistItems, setWishlistItems] = useState([]); // Track wishlist items
  
  // Pagination state - initialize from URL or defaults
  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [productsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Get cart and auth context
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch wishlist data when the page loads if user is logged in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlistItems([]);
        return;
      }
      
      try {
        const response = await wishlistApi.get();
        if (response && response.items) {
          // Extract product IDs from the wishlist response
          const productIds = response.items.map(item => 
            item.productId?._id || item.productId
          ).filter(Boolean);
          
          setWishlistItems(productIds);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, [user]);

  // Available sort options
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const pageParam = searchParams.get('page');
    const sortParam = searchParams.get('sort');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10) || 1);
    }
    
    if (sortParam) {
      setSortBy(sortParam);
    }
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        // Ensure categories data is properly structured
        const categoryArray = categoriesData || [];
        setCategories(categoryArray.map(cat => cat?.name || cat).filter(Boolean));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Sync URL page parameter with component state when URL changes
  // This ensures correct page is shown after returning from product details
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (parsedPage !== currentPage) {
        setCurrentPage(parsedPage || 1);
      }
    }
  }, [searchParams]);
  
  // Fetch products based on filters, sorting, and current page
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Prepare filter object for API
        const filters = {
          page: currentPage,
          limit: productsPerPage,
          sort: sortBy
        };
        
        // Add search parameter from URL if present
        const searchParam = searchParams.get('search');
        if (searchParam) {
          filters.search = searchParam;
        }
        
        // Add category filters if selected
        if (selectedCategories.length > 0) {
          filters.category = selectedCategories.join(',');
        }
        
        // Add brand filters if selected
        if (selectedBrands.length > 0) {
          filters.brand = selectedBrands.join(',');
        }
        
        // Add material filters if selected
        if (selectedMaterials.length > 0) {
          filters.material = selectedMaterials.join(',');
        }
        
        // Add color filters if selected
        if (selectedColors.length > 0) {
          filters.color = selectedColors.join(',');
        }
        
        // Add rating filter if selected - use the minimum rating as threshold
        if (selectedRatings.length > 0) {
          // The rating filter on the backend uses greater-than-or-equal comparison
          // So we need the lowest selected rating as the minimum threshold
          filters.rating = Math.min(...selectedRatings);
        }
        
        // Add price range
        if (priceRange.min > 0 || priceRange.max < 1000) {
          filters.priceMin = priceRange.min;
          filters.priceMax = priceRange.max;
        }
        
        console.log('Sending filters to API:', filters);
        
        // Call API with filters
        const response = await productsApi.getWithFilters(filters);
        
        if (response && response.products) {
          setProducts(response.products);
          
          // Use pagination metadata from API response
          if (response.pagination) {
            setTotalProducts(response.pagination.total);
            setTotalPages(response.pagination.totalPages);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, productsPerPage, sortBy, selectedCategories, selectedBrands, 
      selectedMaterials, selectedColors, selectedRatings, priceRange, searchParams]);
  
  // Update URL parameters when filters or pagination change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update page parameter
    newParams.set('page', currentPage.toString());
    
    // Update category parameter if any selected
    if (selectedCategories.length > 0) {
      newParams.set('category', selectedCategories[0]);
    } else {
      newParams.delete('category');
    }
    
    // Update sort parameter
    if (sortBy !== 'featured') {
      newParams.set('sort', sortBy);
    } else {
      newParams.delete('sort');
    }
    
    // Preserve search parameter if it exists
    const searchParam = searchParams.get('search');
    if (searchParam) {
      newParams.set('search', searchParam);
    }
    
    setSearchParams(newParams);
  }, [currentPage, selectedCategories, sortBy]);
  
  // Effect to extract unique brands, materials, and colors from products
  useEffect(() => {
    if (!loading && products.length > 0) {
      const uniqueBrands = [...new Set(products.map(product => product?.brand))].filter(Boolean);
      const uniqueMaterials = [...new Set(products.map(product => product?.material))].filter(Boolean);
      const uniqueColors = [...new Set(products.map(product => product?.color))].filter(Boolean);
      
      setBrands(uniqueBrands);
      setMaterials(uniqueMaterials);
      setColors(uniqueColors);
    }
  }, [products, loading]);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        return prev.filter(b => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const handleMaterialChange = (material) => {
    setSelectedMaterials(prev => {
      if (prev.includes(material)) {
        return prev.filter(m => m !== material);
      } else {
        return [...prev, material];
      }
    });
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const handleColorChange = (color) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      } else {
        return [...prev, color];
      }
    });
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const handleRatingChange = (rating) => {
    setSelectedRatings(prev => {
      if (prev.includes(rating)) {
        return prev.filter(r => r !== rating);
      } else {
        return [...prev, rating];
      }
    });
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    
    // Reset to page 1 when sorting changes
    setCurrentPage(1);
  };

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSelectedRatings([]);
    setPriceRange({ min: 0, max: 1000 });
    setSortBy('featured');
    
    // Reset to page 1 when filters are reset
    setCurrentPage(1);
  };

  const handleSectionChange = (section) => {
    setCurrentSection(section);

    // Reset pagination when switching sections
    setCurrentPage(1);

    // Different API endpoints for different sections
    const fetchSectionData = async () => {
      setLoading(true);
      try {
        let response;
        
        if (section === 'featured-products') {
          response = await productsApi.getFeatured();
          setProducts(response || []);
          setTotalProducts(response?.length || 0);
          setTotalPages(Math.ceil((response?.length || 0) / productsPerPage));
        } 
        else if (section === 'new-arrivals') {
          response = await productsApi.getNewArrivals();
          setProducts(response || []);
          setTotalProducts(response?.length || 0);
          setTotalPages(Math.ceil((response?.length || 0) / productsPerPage));
        } 
        else {
          // Default to all products with pagination
          response = await productsApi.getAll(1, productsPerPage, sortBy);
          if (response && response.products) {
            setProducts(response.products);
            if (response.pagination) {
              setTotalProducts(response.pagination.total);
              setTotalPages(response.pagination.totalPages);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching ${section}:`, error);
        toast.error('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  };

  const openModal = (product) => {
    setModalProduct(product);
    setQuantity(1);
    setShowModal(true);
    setCurrentProductId(product.id);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalProduct(null);
    setQuantity(1);
  };

  const updateQuantity = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const addToCart = (product, qty) => {
    if (user) {
      console.log('Adding product to cart:', product);
      addItem(product, qty);
    } else {
      toast.error('Please log in to add items to your cart.');
    }
  };

  const addToWishlist = (productId) => {
    if (user) {
      // Check if the item is already in wishlist
      const isInWishlist = wishlistItems.includes(productId);
      
      if (isInWishlist) {
        // Remove from wishlist if already there
        wishlistApi.remove(productId)
          .then(() => {
            // Remove from local state
            setWishlistItems(prev => prev.filter(id => id !== productId));
            toast.success('Product removed from wishlist!');
          })
          .catch((error) => {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
          });
      } else {
        // Add to wishlist
        wishlistApi.add(productId)
          .then(() => {
            // Add to local state
            setWishlistItems(prev => [...prev, productId]);
            toast.success('Product added to wishlist!');
          })
          .catch((error) => {
            console.error('Error adding to wishlist:', error);
            toast.error('Failed to add to wishlist');
          });
      }
    } else {
      toast.error('Please log in to manage your wishlist.');
    }
  };

  const buyNow = (productId) => {
    if (user) {
      window.location.href = `/checkout?product=${productId}&quantity=${quantity}`;
    } else {
      toast.error('Please log in to proceed with the purchase.');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Shop Collection</h1>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button 
              className="md:hidden flex items-center text-sm font-medium"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex mb-6 overflow-x-auto">
          <button 
            className={`px-4 py-2 mr-2 rounded ${currentSection === 'all-products' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleSectionChange('all-products')}
          >
            All Products
          </button>
          <button 
            className={`px-4 py-2 mr-2 rounded ${currentSection === 'featured-products' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleSectionChange('featured-products')}
          >
            Featured Products
          </button>
          <button 
            className={`px-4 py-2 mr-2 rounded ${currentSection === 'new-arrivals' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleSectionChange('new-arrivals')}
          >
            New Arrivals
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters (desktop) */}
          <div className={`md:w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-md md:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button 
                className="text-sm text-purple-600 hover:text-purple-800"
                onClick={resetFilters}
              >
                Reset All
              </button>
            </div>
            
            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="mb-2">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value={priceRange.max} 
                  onChange={(e) => handlePriceChange(e, 'max')} 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-gray-600 mt-1">Price: ${priceRange.min} - ${priceRange.max}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange(e, 'min')}
                  min="0"
                  max={priceRange.max}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange(e, 'max')}
                  min={priceRange.min}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
            
            {/* Brand Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Brand</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map(brand => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-700">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Material Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Material</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {materials.map(material => (
                  <div key={material} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`material-${material}`}
                      checked={selectedMaterials.includes(material)}
                      onChange={() => handleMaterialChange(material)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`material-${material}`} className="ml-2 text-sm text-gray-700">
                      {material}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Color Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Color</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {colors.map(color => (
                  <div key={color} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`color-${color}`}
                      checked={selectedColors.includes(color)}
                      onChange={() => handleColorChange(color)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`color-${color}`} className="ml-2 text-sm text-gray-700">
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`rating-${rating}`}
                      checked={selectedRatings.includes(rating)}
                      onChange={() => handleRatingChange(rating)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`rating-${rating}`} className="ml-2 text-sm text-gray-700 flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">
                          {i < rating ? '★' : '☆'}
                        </span>
                      ))}
                      <span className="ml-1">& Up</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:hidden">
              <h3 className="font-medium mb-2">Sort By</h3>
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg overflow-hidden shadow-md">
                    <div className="bg-gray-300 h-64 w-full"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                      <div className="h-10 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {products.length} of {totalProducts} products (Page {currentPage} of {totalPages})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => {
                    // Skip rendering if product is null or undefined
                    if (!product) return null;
                    
                    const productId = product._id || product.id;
                    const isInWishlist = wishlistItems.includes(productId);
                    
                    return (
                      <ProductCard 
                        key={productId || Math.random().toString()}
                        product={{
                          id: productId,
                          name: product.name || 'Unnamed Product',
                          price: product.price || 0,
                          startingPrice: product.startingPrice || product.price || 0,
                          sale: product.sale || false,
                          rating: product.rating || 0,
                          reviewCount: product.reviewCount || 0,
                          image: (product.images && product.images.length > 0) ? product.images[0] : null,
                          category: product.category || 'Uncategorized',
                          stock: product.stock ?? 10
                        }}
                        isInWishlist={isInWishlist}
                        onWishlistToggle={() => addToWishlist(productId)}
                        onQuickView={() => openModal(product)}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filters or browse our categories.</p>
                <div className="mt-6">
                  <Button onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

       
      </div>

      {/* Product Modal */}
      {showModal && modalProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{modalProduct.name || 'Product Details'}</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="md:flex p-6">
              <div className="md:w-1/2 mb-4 md:mb-0 md:mr-6">
                <img 
                  src={modalProduct.images && modalProduct.images.length > 0 ? modalProduct.images[0] : '/images/default-image.png'} 
                  alt={modalProduct.name} 
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
              <div className="md:w-1/2">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(modalProduct.rating || 0) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({modalProduct.reviewCount || 0} Reviews)</span>
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Category:</span> {modalProduct.category}
                </div>
                <div className="mb-4">
                  {modalProduct.sale ? (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900">${modalProduct.price}</span>
                      <span className="ml-2 text-lg line-through text-gray-500">${modalProduct.startingPrice}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">${modalProduct.price}</span>
                  )}
                </div>
                <p className="text-gray-700 mb-6">{modalProduct.description}</p>
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <button 
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                      onClick={() => updateQuantity(-1)}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      readOnly
                      className="w-12 h-8 text-center border-t border-b border-gray-300"
                    />
                    <button 
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                      onClick={() => updateQuantity(1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => addToCart(modalProduct, quantity)}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => buyNow(modalProduct._id || modalProduct.id)}
                      className="flex-1 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => addToWishlist(modalProduct._id || modalProduct.id)}
                  className="flex items-center text-gray-700 hover:text-red-500"
                >
                  <svg className={`w-5 h-5 ${wishlistItems.includes(modalProduct._id || modalProduct.id) ? 'text-red-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Add to Wishlist
                </button>
                <button 
                  onClick={() => navigate(`/product/${modalProduct._id || modalProduct.id}`)}
                  className="flex items-center text-blue-600 hover:text-blue-700 ml-4 mt-2"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {products.length > 0 && totalPages > 1 && (
        <div className="flex justify-center my-8">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button 
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* First page */}
            {currentPage > 3 && (
              <button
                onClick={() => paginate(1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                1
              </button>
            )}
            
            {/* Ellipsis if needed */}
            {currentPage > 4 && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
            )}
            
            {/* Page numbers */}
            {[...Array(totalPages).keys()].map(number => {
              const pageNumber = number + 1;
              // Show current page and 1 page before and after
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      pageNumber === currentPage
                        ? 'border-purple-500 bg-purple-50 text-purple-600 hover:bg-purple-100'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}
            
            {/* Ellipsis if needed */}
            {currentPage < totalPages - 3 && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
            )}
            
            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <button
                onClick={() => paginate(totalPages)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            )}
            
            <button 
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </MainLayout>
  );
};

export default ShopPage;