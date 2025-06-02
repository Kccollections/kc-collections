import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import ReviewList from '../components/review/ReviewList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { api } from '../services/realApi';

// Base URL for images - change this to match your server configuration
const IMAGE_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to format image URLs correctly
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '/images/default-image.png';
  
  // Handle already complete URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Ensure we have the correct path formatting
  if (!imagePath.startsWith('/')) {
    imagePath = `/${imagePath}`;
  }
  
  return `${IMAGE_BASE_URL}${imagePath}`;
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  // Get cart context
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching product data for ID:', id);
        
        // Use the productsApi.getById method to fetch product data
        const result = await api.products.getById(id);
        console.log('API response:', result);
        
        // Check if the API returned data in different formats
        let productData;
        let relatedProductsData = [];
        
        if (result && result.product) {
          // Handle response format where product is nested
          productData = result.product;
          relatedProductsData = result.relatedProducts || [];
        } else {
          // Handle direct product object response
          productData = result;
        }
        
        if (!productData) {
          throw new Error('Product not found');
        }

        // Process the product data to ensure all fields are available
        const processedProduct = {
          ...productData,
          // Make sure all essential fields have default values if missing
          images: productData.images || [],
          price: productData.price || 0,
          rating: productData.rating || 0,
          reviewCount: productData.reviewCount || 0,
          stock: productData.stock ?? 10, // Default to 10 if stock is undefined
          sale: productData.sale || false,
          startingPrice: productData.startingPrice || productData.price || 0
        };
        
        // Process image URLs to ensure they are complete paths
        if (processedProduct.images && processedProduct.images.length > 0) {
          processedProduct.images = processedProduct.images.map(img => getFullImageUrl(img));
        } else {
          processedProduct.images = ['/images/default-image.png'];
        }
        
        console.log('Processed product data:', processedProduct);
        
        setProduct(processedProduct);
        
        // Set main image to the first image
        if (processedProduct.images.length > 0) {
          setMainImage(processedProduct.images[0]);
        }
        
        // Only fetch related products if we don't already have them and we have a category
        if (relatedProductsData.length === 0 && processedProduct.category) {
          try {
            relatedProductsData = await api.products.getByCategory(processedProduct.category);
            
            if (Array.isArray(relatedProductsData)) {
              // Process related products to ensure all have complete image URLs
              relatedProductsData = relatedProductsData
                .filter(item => item && (item._id !== processedProduct._id && item.id !== processedProduct.id))
                .map(item => ({
                  ...item,
                  images: (item.images || []).map(img => getFullImageUrl(img))
                }))
                .slice(0, 4); // Limit to 4 related products
            }
          } catch (relatedError) {
            console.error('Error fetching related products:', relatedError);
            relatedProductsData = [];
          }
        }
        
        setRelatedProducts(relatedProductsData);
        
      } catch (error) {
        console.error('Failed to fetch product data:', error);
        setError(error.message || 'Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (user) {
      if (product) {
        console.log('ProductDetailsPage - Adding to cart:', product);
        // Pass the entire product object, not just the ID
        addItem(product, quantity);
        toast.success(`${product.name} added to cart!`);
      }
    } else {
      toast.error('Please log in to add items to your cart.');
    }
  };

  const handleAddToWishlist = () => {
    if (user) {
      if (product && product._id) {
        api.addToWishlist(user.id, product._id);
        toast.success(`${product.name} added to wishlist!`);
      }
    } else {
      toast.error('Please log in to add items to your wishlist.');
    }
  };

  const handleBuyNow = () => {
    if (user) {
      if (product) {
        // Pass the entire product object, not just the ID
        addItem(product, quantity);
        window.location.href = '/user/checkout';
      }
    } else {
      toast.error('Please log in to proceed with checkout.');
    }
  };
  
  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={`star-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        // Simplified half-star rendering
        stars.push(
          <div key={`star-${i}`} className="relative w-5 h-5">
            <svg className="absolute w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="absolute w-[50%] h-full overflow-hidden">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        );
      } else {
        stars.push(
          <svg key={`star-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    
    return (
      <div className="flex" role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
        {stars}
      </div>
    );
  };
  
  // Functions to increment/decrement quantity
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-16">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="mb-8">Sorry, the product you are looking for does not exist or has been removed.</p>
            <Link to="/shop">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const stockStatus = product.stock !== undefined ? (
    product.stock > 10 
      ? { class: 'text-green-600', text: 'In Stock' } 
      : product.stock > 0 
        ? { class: 'text-yellow-600', text: `Only ${product.stock} left` } 
        : { class: 'text-red-600', text: 'Out of Stock' }
  ) : { class: 'text-gray-600', text: 'Status Unknown' };

  const isOutOfStock = product.stock === 0 || product.stock === undefined;

  const discountPercentage = product.sale && product.startingPrice && product.price && product.startingPrice > product.price 
    ? Math.round(((product.startingPrice - product.price) / product.startingPrice) * 100) 
    : null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <nav className="flex mb-8 text-sm">
          <Link to="/" className="text-gray-500 hover:text-purple-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/shop" className="text-gray-500 hover:text-purple-600">Shop</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/shop?category=${product.category}`} className="text-gray-500 hover:text-purple-600">{product.category}</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
              <img 
                src={mainImage || (product.images && product.images.length > 0 ? product.images[0] : '/images/default-image.png')} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`
                      flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all
                      ${mainImage === image ? 'border-purple-600' : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => setMainImage(image)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {product.isNew && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-purple-100 text-purple-800">
                    New
                  </span>
                )}
                {product.sale && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-800">
                    Sale
                  </span>
                )}
                {discountPercentage && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-800">
                    {discountPercentage}% Off
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex">
                  {renderStars(product.rating)}
                </div>
                {product.reviewCount > 0 && (
                  <span className="text-sm text-gray-500">{product.reviewCount} Reviews</span>
                )}
              </div>
            </div>
            
            <div>
              {product.sale && product.price && product.startingPrice ? (
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-purple-700">${(product.price || 0).toFixed(2)}</span>
                  <span className="ml-3 text-lg text-gray-500 line-through">${(product.startingPrice || 0).toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-purple-700">${(product.price || 0).toFixed(2)}</span>
              )}
            </div>
            
            <div>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Details</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span> 
                    <span className="font-medium">{product.category}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-600">Material:</span> 
                    <span className="font-medium">{product.material}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-600">Color:</span> 
                    <span className="font-medium">{product.color}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-600">Weight:</span> 
                    <span className="font-medium">{product.weight} g</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-600">Dimensions:</span> 
                    <span className="font-medium">{product.dimensions}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-600">Brand:</span> 
                    <span className="font-medium">{product.brand}</span>
                  </li>
                </ul>
              </div>
              
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Features</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Availability:</span>
                <span className={stockStatus.class}>{stockStatus.text}</span>
              </div>
              
              {!isOutOfStock && (
                <div className="flex space-x-4 items-center">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button 
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <Button 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock}
                    className="flex-1"
                    size="lg"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddToWishlist}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          
          {product.reviews && product.reviews.length > 0 ? (
            <ReviewList reviews={product.reviews} />
          ) : (
            <p className="text-gray-500">This product has no reviews yet. Be the first to leave a review!</p>
          )}
          
          <div className="mt-8 text-center">
            <Button>Write a Review</Button>
          </div>
        </div>
        
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(related => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductDetailsPage;