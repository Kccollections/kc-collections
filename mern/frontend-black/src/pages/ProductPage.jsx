// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import MainLayout from '../layouts/MainLayout';
// import Button from '../components/ui/Button';
// import { useCart } from '../context/CartContext';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-hot-toast';

// // Import the API utilities - using ES module imports instead of require
// import { productsApi as pApi, reviewsApi as rApi, wishlistApi as wApi } from '../services/realApi';

// // Set up fallback mock methods to prevent crashes
// let productsApi, reviewsApi, wishlistApi;
// try {
//   productsApi = pApi;
//   reviewsApi = rApi;
//   wishlistApi = wApi;
// } catch (err) {
//   console.error('Failed to import API utilities:', err);
//   // Create fallback mock methods to prevent crashes
//   productsApi = {
//     getById: () => Promise.resolve({}),
//     getRelated: () => Promise.resolve([]),
//   };
//   reviewsApi = {
//     getByProductId: () => Promise.resolve([]),
//   };
//   wishlistApi = {
//     add: () => Promise.resolve({}),
//   };
// }

// const ProductPage = () => {
//   const { id } = useParams(); // Get product ID from URL
//   const navigate = useNavigate();
//   const { addItem: addToCart } = useCart();
//   const { user } = useAuth();
  
//   // State variables
//   const [product, setProduct] = useState(null);
//   const [relatedProducts, setRelatedProducts] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [activeTab, setActiveTab] = useState('description');

//   // Fetch product data when component loads or ID changes
//   useEffect(() => {
//     const fetchProductData = async () => {
//       if (!id) {
//         setError('No product ID provided');
//         setLoading(false);
//         return;
//       }

//       console.log('Fetching product data for ID:', id);
//       setLoading(true);
//       setError(null);
      
//       try {
//         // Attempt to fetch product details
//         const response = await productsApi.getById(id);
//         console.log('API Response:', response);
        
//         if (response && response.product) {
//           // Handle response format where both product and related products are included
//           setProduct(response.product);
//           setRelatedProducts(response.relatedProducts || []);
//         } else if (response) {
//           // Handle response where only product data is returned
//           setProduct(response);
          
//           // Try to fetch related products separately
//           try {
//             const relatedData = await productsApi.getRelated(id);
//             if (Array.isArray(relatedData)) {
//               setRelatedProducts(relatedData);
//             }
//           } catch (relErr) {
//             console.error('Error fetching related products:', relErr);
//           }
//         } else {
//           throw new Error('Invalid product data received');
//         }
        
//         // Fetch product reviews if available
//         try {
//           const reviewData = await reviewsApi.getByProductId(id);
//           if (Array.isArray(reviewData)) {
//             setReviews(reviewData);
//           }
//         } catch (revErr) {
//           console.error('Error fetching reviews:', revErr);
//         }
        
//       } catch (err) {
//         console.error('Error fetching product:', err);
//         setError(err.message || 'Failed to load product');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductData();
//   }, [id]);

//   // Handler functions
//   const handleAddToCart = () => {
//     try {
//       if (!user) {
//         toast.error('Please login to add items to cart');
//         return;
//       }
      
//       if (!product) {
//         toast.error('Product information is missing');
//         return;
//       }
      
//       addToCart(product, quantity);
//       toast.success(`${product.name} added to cart`);
//     } catch (err) {
//       console.error('Error adding to cart:', err);
//       toast.error('Failed to add item to cart');
//     }
//   };

//   const handleAddToWishlist = async () => {
//     try {
//       if (!user) {
//         toast.error('Please login to add items to wishlist');
//         return;
//       }
      
//       if (!product || !product._id) {
//         toast.error('Product information is missing');
//         return;
//       }
      
//       await wishlistApi.add(user.id, product._id);
//       toast.success(`${product.name} added to wishlist`);
//     } catch (err) {
//       console.error('Error adding to wishlist:', err);
//       toast.error('Failed to add to wishlist');
//     }
//   };

//   const handleBuyNow = () => {
//     try {
//       if (!user) {
//         toast.error('Please login to proceed with purchase');
//         return;
//       }
      
//       if (!product) {
//         toast.error('Product information is missing');
//         return;
//       }
      
//       addToCart(product, quantity);
//       navigate('/checkout');
//     } catch (err) {
//       console.error('Error with buy now:', err);
//       toast.error('Failed to proceed to checkout');
//     }
//   };

//   const incrementQuantity = () => {
//     if (product && quantity < (product.stock || 10)) {
//       setQuantity(prevQty => prevQty + 1);
//     }
//   };

//   const decrementQuantity = () => {
//     if (quantity > 1) {
//       setQuantity(prevQty => prevQty - 1);
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="container mx-auto px-4 py-8">
//           <div className="animate-pulse">
//             <div className="flex flex-col md:flex-row gap-8">
//               <div className="md:w-1/2">
//                 <div className="bg-gray-300 h-96 w-full rounded-lg"></div>
//               </div>
//               <div className="md:w-1/2">
//                 <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
//                 <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
//                 <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
//                 <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
//                 <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
//                 <div className="h-10 bg-gray-300 rounded w-1/3 mb-6"></div>
//                 <div className="h-12 bg-gray-300 rounded w-full"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   // Error state
//   if (error || !product) {
//     return (
//       <MainLayout>
//         <div className="container mx-auto px-4 py-8">
//           <div className="text-center py-12">
//             <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
//             <p className="mb-6">Sorry, we couldn't find the product you're looking for.</p>
//             {error && <p className="text-red-500 mb-4">{error}</p>}
//             <Button as={Link} to="/shop">
//               Back to Shop
//             </Button>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   // Safely extract product properties with defaults to prevent errors
//   const {
//     name = 'Unnamed Product',
//     category = 'Uncategorized',
//     price = 0,
//     startingPrice = price || 0,
//     sale = false,
//     description = 'No description available',
//     brand = '',
//     stock = 0,
//     material = '',
//     weight = '',
//     dimensions = '',
//     rating = 0,
//     color = '',
//     images = [],
//   } = product;

//   // Create a features array from product properties
//   const features = [
//     brand && `Brand: ${brand}`,
//     material && `Material: ${material}`,
//     weight && `Weight: ${weight}${typeof weight === 'number' ? 'g' : ''}`,
//     dimensions && `Dimensions: ${dimensions}`,
//     color && `Color: ${color}`
//   ].filter(Boolean); // Filter out empty values

//   // Main render
//   return (
//     <MainLayout>
//       <div className="container mx-auto px-4 py-8">
//         {/* Breadcrumbs */}
//         <nav className="mb-6">
//           <ol className="flex text-sm text-gray-500">
//             <li className="mr-1">
//               <Link to="/" className="hover:text-purple-600">Home</Link>
//               <span className="mx-1">/</span>
//             </li>
//             <li className="mr-1">
//               <Link to="/shop" className="hover:text-purple-600">Shop</Link>
//               <span className="mx-1">/</span>
//             </li>
//             {category && (
//               <li className="mr-1">
//                 <Link to={`/shop?category=${encodeURIComponent(category)}`} className="hover:text-purple-600">
//                   {category}
//                 </Link>
//                 <span className="mx-1">/</span>
//               </li>
//             )}
//             <li className="font-medium text-gray-900">{name}</li>
//           </ol>
//         </nav>

//         {/* Product Info */}
//         <div className="flex flex-col md:flex-row gap-8 mb-12">
//           {/* Product Images */}
//           <div className="md:w-1/2">
//             <div className="relative pb-[100%] overflow-hidden rounded-lg mb-4">
//               <img
//                 src={images && images.length > 0 ? images[selectedImage] : '/placeholder-image.jpg'}
//                 alt={name}
//                 className="absolute inset-0 w-full h-full object-cover"
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = '/placeholder-image.jpg';
//                 }}
//               />
//             </div>
//             {images && images.length > 1 && (
//               <div className="grid grid-cols-4 gap-2">
//                 {images.map((image, index) => (
//                   <button
//                     key={index}
//                     className={`relative pb-[100%] overflow-hidden rounded-lg border-2 
//                       ${selectedImage === index ? 'border-purple-500' : 'border-transparent'}`}
//                     onClick={() => setSelectedImage(index)}
//                   >
//                     <img
//                       src={image}
//                       alt={`${name} ${index + 1}`}
//                       className="absolute inset-0 w-full h-full object-cover"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = '/placeholder-image.jpg';
//                       }}
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Product Details */}
//           <div className="md:w-1/2">
//             <h1 className="text-3xl font-bold mb-2">{name}</h1>
            
//             {/* Rating */}
//             <div className="flex items-center mb-4">
//               <div className="flex">
//                 {[...Array(5)].map((_, i) => (
//                   <svg 
//                     key={i} 
//                     className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
//                     fill="currentColor" 
//                     viewBox="0 0 20 20"
//                   >
//                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                   </svg>
//                 ))}
//               </div>
//               <span className="text-sm text-gray-500 ml-2">{reviews?.length || 0} reviews</span>
//             </div>

//             {/* Price */}
//             <div className="mb-6">
//               {sale && startingPrice > price ? (
//                 <div className="flex items-center">
//                   <span className="text-2xl font-bold">${typeof price === 'number' ? price.toFixed(2) : price}</span>
//                   <span className="ml-2 text-lg line-through text-gray-500">
//                     ${typeof startingPrice === 'number' ? startingPrice.toFixed(2) : startingPrice}
//                   </span>
//                   <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-md">SALE</span>
//                 </div>
//               ) : (
//                 <span className="text-2xl font-bold">${typeof price === 'number' ? price.toFixed(2) : price}</span>
//               )}
//             </div>

//             {/* Short Description */}
//             <p className="text-gray-600 mb-6">{description}</p>

//             {/* Availability */}
//             <div className="mb-6">
//               <span className={`font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                 {stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}
//               </span>
//             </div>

//             {/* Quantity Selector */}
//             {stock > 0 && (
//               <div className="flex items-center mb-6">
//                 <span className="mr-4 font-medium">Quantity:</span>
//                 <div className="flex items-center border border-gray-300 rounded-md">
//                   <button
//                     type="button"
//                     className="px-3 py-1 text-gray-600 hover:text-gray-900"
//                     onClick={decrementQuantity}
//                     disabled={quantity <= 1}
//                   >
//                     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
//                     </svg>
//                   </button>
//                   <input
//                     type="text"
//                     className="w-12 text-center border-0 focus:outline-none focus:ring-0"
//                     value={quantity}
//                     readOnly
//                   />
//                   <button
//                     type="button"
//                     className="px-3 py-1 text-gray-600 hover:text-gray-900"
//                     onClick={incrementQuantity}
//                     disabled={quantity >= stock}
//                   >
//                     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Add to Cart & Buy Now Buttons */}
//             <div className="flex flex-col sm:flex-row gap-3 mb-8">
//               <Button 
//                 onClick={handleAddToCart} 
//                 disabled={stock === 0}
//                 fullWidth
//               >
//                 {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
//               </Button>
//               <Button 
//                 variant="outline"
//                 fullWidth
//                 onClick={handleAddToWishlist}
//               >
//                 Add to Wishlist
//               </Button>
//               {stock > 0 && (
//                 <Button 
//                   onClick={handleBuyNow}
//                   variant="dark"
//                   fullWidth
//                 >
//                   Buy Now
//                 </Button>
//               )}
//             </div>

//             {/* Additional Info */}
//             <div className="border-t border-gray-200 pt-4">
//               <div className="flex flex-col gap-2 text-sm">
//                 {product._id && (
//                   <div className="flex">
//                     <span className="font-medium min-w-[100px]">SKU:</span>
//                     <span className="text-gray-600">{product._id}</span>
//                   </div>
//                 )}
//                 {category && (
//                   <div className="flex">
//                     <span className="font-medium min-w-[100px]">Category:</span>
//                     <Link to={`/shop?category=${encodeURIComponent(category)}`} className="text-purple-600 hover:underline">
//                       {category}
//                     </Link>
//                   </div>
//                 )}
//                 {material && (
//                   <div className="flex">
//                     <span className="font-medium min-w-[100px]">Material:</span>
//                     <span className="text-gray-600">{material}</span>
//                   </div>
//                 )}
//                 {brand && (
//                   <div className="flex">
//                     <span className="font-medium min-w-[100px]">Brand:</span>
//                     <span className="text-gray-600">{brand}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Product Tabs */}
//         <div className="mb-12">
//           <div className="border-b border-gray-200">
//             <nav className="flex overflow-x-auto -mb-px">
//               <button
//                 className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
//                   activeTab === 'description'
//                     ? 'border-purple-600 text-purple-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//                 onClick={() => setActiveTab('description')}
//               >
//                 Description
//               </button>
//               {features.length > 0 && (
//                 <button
//                   className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
//                     activeTab === 'features'
//                       ? 'border-purple-600 text-purple-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                   onClick={() => setActiveTab('features')}
//                 >
//                   Features
//                 </button>
//               )}
//               <button
//                 className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
//                   activeTab === 'reviews'
//                     ? 'border-purple-600 text-purple-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//                 onClick={() => setActiveTab('reviews')}
//               >
//                 Reviews ({reviews?.length || 0})
//               </button>
//             </nav>
//           </div>

//           <div className="py-6">
//             {activeTab === 'description' && (
//               <div>
//                 <p className="text-gray-600 whitespace-pre-line">{description}</p>
//               </div>
//             )}
            
//             {activeTab === 'features' && features.length > 0 && (
//               <div>
//                 <ul className="list-disc pl-5 space-y-2 text-gray-600">
//                   {features.map((feature, index) => (
//                     <li key={index}>{feature}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
            
//             {activeTab === 'reviews' && (
//               <div>
//                 <div className="mb-8">
//                   <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
//                   <div className="flex items-center mb-4">
//                     <div className="flex">
//                       {[...Array(5)].map((_, i) => (
//                         <svg 
//                           key={i} 
//                           className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
//                           fill="currentColor" 
//                           viewBox="0 0 20 20"
//                         >
//                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                         </svg>
//                       ))}
//                       <span className="ml-2">{rating}/5</span>
//                     </div>
//                     <span className="mx-3">•</span>
//                     <span>{reviews?.length || 0} reviews</span>
//                     <Button 
//                       variant="link" 
//                       className="ml-auto"
//                       onClick={() => user ? navigate(`/products/${id}/review/new`) : toast.error('Please login to write a review')}
//                     >
//                       Write a Review
//                     </Button>
//                   </div>
//                 </div>

//                 {reviews && reviews.length > 0 ? (
//                   <div className="space-y-6">
//                     {reviews.map((review) => (
//                       <div key={review._id || review.id || Math.random()} className="border-b border-gray-200 pb-6">
//                         <div className="flex items-center mb-2">
//                           <div className="flex">
//                             {[...Array(5)].map((_, i) => (
//                               <svg 
//                                 key={i} 
//                                 className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
//                                 fill="currentColor" 
//                                 viewBox="0 0 20 20"
//                               >
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                             ))}
//                           </div>
//                         </div>
//                         <div className="flex items-center mb-2">
//                           <h4 className="text-sm font-semibold">{review.userName || review.name || 'Anonymous'}</h4>
//                           {review.verified && (
//                             <span className="ml-2 bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
//                               Verified Purchase
//                             </span>
//                           )}
//                         </div>
//                         <div className="text-sm text-gray-500 mb-2">
//                           {new Date(review.date || review.createdAt || Date.now()).toLocaleDateString('en-US', {
//                             year: 'numeric',
//                             month: 'long',
//                             day: 'numeric',
//                           })}
//                         </div>
//                         <p className="text-gray-600">{review.comment || review.text || 'No comment provided'}</p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Related Products */}
//         {relatedProducts && relatedProducts.length > 0 && (
//           <div>
//             <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {relatedProducts.map((relatedProduct) => (
//                 <div key={relatedProduct._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
//                   <Link to={`/product/${relatedProduct._id}`}>
//                     <div className="relative pb-[100%]">
//                       {relatedProduct.images && relatedProduct.images.length > 0 ? (
//                         <img 
//                           src={relatedProduct.images[0]}
//                           alt={relatedProduct.name}
//                           className="absolute inset-0 w-full h-full object-cover"
//                           onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.src = '/placeholder-image.jpg';
//                           }}
//                         />
//                       ) : (
//                         <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
//                           <span className="text-gray-400">No image</span>
//                         </div>
//                       )}
//                       {relatedProduct.sale && (
//                         <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1">
//                           SALE
//                         </div>
//                       )}
//                     </div>
//                   </Link>
//                   <div className="p-4">
//                     <Link to={`/product/${relatedProduct._id}`}>
//                       <h3 className="font-semibold text-lg mb-1 hover:text-purple-600 truncate">
//                         {relatedProduct.name || 'Unnamed Product'}
//                       </h3>
//                     </Link>
//                     <div className="mb-2 text-sm">
//                       <span className="text-gray-500">{relatedProduct.category || 'Uncategorized'}</span>
//                     </div>
//                     <div className="font-bold text-lg">
//                       {relatedProduct.sale && relatedProduct.startingPrice > relatedProduct.price ? (
//                         <div className="flex items-center">
//                           <span>${typeof relatedProduct.price === 'number' ? relatedProduct.price.toFixed(2) : relatedProduct.price}</span>
//                           <span className="ml-2 text-sm line-through text-gray-500">
//                             ${typeof relatedProduct.startingPrice === 'number' ? relatedProduct.startingPrice.toFixed(2) : relatedProduct.startingPrice}
//                           </span>
//                         </div>
//                       ) : (
//                         <span>${typeof relatedProduct.price === 'number' ? relatedProduct.price.toFixed(2) : relatedProduct.price}</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// };

// export default ProductPage;