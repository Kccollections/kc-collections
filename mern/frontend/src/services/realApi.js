// Real API service for KC Collection
// This file handles actual backend API calls


// addToCart as apiAddToCart, updateCartItem, removeFromCart, clearCart as apiClearCart, getUserCart

import { get } from "mongoose";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function for making API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Get auth token from localStorage if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Configure the request
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Parse JSON response
    const data = await response.json();
    
    // Check if request was successful
    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(data.error || data.message || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};


// API functions for products
export const productsApi = {
  getAll: (page = 1, limit = 9, sort = 'featured') => 
    apiRequest(`/products?page=${page}&limit=${limit}&sort=${sort}`),
  getWithFilters: (filters = {}) => {
    // Build query string from filters object
    const queryParams = new URLSearchParams();
    
    // Add pagination params
    queryParams.append('page', filters.page || 1);
    queryParams.append('limit', filters.limit || 9);
    queryParams.append('sort', filters.sort || 'featured');
    
    // Add other filter params if they exist
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.brand) queryParams.append('brand', filters.brand);
    if (filters.material) queryParams.append('material', filters.material);
    if (filters.color) queryParams.append('color', filters.color);
    if (filters.rating) queryParams.append('rating', filters.rating);
    
    // Fix for price range
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      queryParams.append('price', `${filters.priceMin}-${filters.priceMax}`);
    }
    
    console.log(`API Request with filters: ${queryParams.toString()}`);
    return apiRequest(`/products?${queryParams.toString()}`);
  },
  getById: (id) => apiRequest(`/products/${id}`),
  getByCategory: (category) => apiRequest(`/products/category/${category}`),
  getFeatured: () => apiRequest('/products/featured?limit=10'), // Always limit to 10 products max
  getNewArrivals: () => apiRequest('/products/new-arrivals'),
  getOnSale: () => apiRequest('/products/on-sale'),
  getRelated: (productId) => apiRequest(`/products/${productId}/related`),
  // search: (query) => apiRequest(`/products/search?q=${query}`),
  getFiltered: (filters) => apiRequest('/products/filter', {
    method: 'POST',
    body: JSON.stringify(filters),
  }),
  getPriceRange: () => apiRequest('/products/price-range'),
  getRecommended: (userId) => apiRequest(`/products/recommended/${userId}`),
};

// API functions for authentication
export const authApi = {
  login: (identifier, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  }),
  loginWithOtp: (identifier, otp) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, otp, authMethod: 'otp' }),
  }),
  sendOtp: (identifier) => apiRequest('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
  getUserProfile: (userId) => apiRequest(`/profile/${userId}`),
  updateUserProfile: (userId, userData) => apiRequest(`/profile/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// API functions for users
export const usersApi = {
  getAddresses: () => apiRequest('/address'),
  addAddress: (address) => apiRequest('/address', {
    method: 'POST',
    body: JSON.stringify({
      name: address.name,
      mobile: address.phone,
      streetAddress: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.zipCode,
      country: address.country,
      isDefault: address.default
    }),
  }),
  updateAddress: (addressId, address) => apiRequest(`/address/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: address.name,
      mobile: address.phone,
      streetAddress: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.zipCode,
      country: address.country,
      isDefault: address.default
    }),
  }),
  deleteAddress: (addressId) => apiRequest(`/address/${addressId}`, {
    method: 'DELETE',
  }),
  getOrders: () => apiRequest('/orders/my-orders'), // Updated to use correct endpoint
  getWishlist: (userId) => apiRequest(`/wishlist/${userId}`),
  addToWishlist: (userId, productId) => apiRequest(`/wishlist/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  removeFromWishlist: (userId, productId) => apiRequest(`/wishlist/${userId}/${productId}`, {
    method: 'DELETE',
  }),
  getPaymentMethods: (userId) => apiRequest(`/profile/${userId}/payment-methods`),
};

// API functions for cart
export const cartApi = {
  // get: (userId) => {
  //   console.log(`Getting cart for user: ${userId}`);
  //   return apiRequest(`/cart/${userId}`);
  // },
  get: (userId) => {
    console.log(`Getting cart for user: ${userId}`);
    return apiRequest(`/cart/${userId}`);
  },
  
  add: (userId, productId, quantity) => {
    console.log(`Adding to cart: userId=${userId}, productId=${productId}, quantity=${quantity}`);
    
    // Handle if productId is an object (MongoDB document)
    const productIdValue = typeof productId === 'object' ? 
      (productId._id || productId.id) : productId;
    
    return apiRequest(`/cart/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ productId: productIdValue, quantity }),
    });
  },
  
  update: (userId, productId, quantity) => {
    console.log(`Updating cart: userId=${userId}, productId=${productId}, quantity=${quantity}`);
    
    // Handle if productId is an object (MongoDB document)
    const productIdValue = typeof productId === 'object' ? 
      (productId._id || productId.id) : productId;
    
    return apiRequest(`/cart/${userId}/${productIdValue}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },
  
  remove: (userId, productId) => {
    console.log(`Removing from cart: userId=${userId}, productId=${productId}`);
    
    // Handle if productId is an object (MongoDB document)
    const productIdValue = typeof productId === 'object' ? 
      (productId._id || productId.id) : productId;
    
    return apiRequest(`/cart/${userId}/${productIdValue}`, {
      method: 'DELETE',
    });
  },
  
  clear: (userId) => {
    console.log(`Clearing cart for user: ${userId}`);
    return apiRequest(`/cart/${userId}/clear`, {
      method: 'DELETE',
    });
  },
};

export const wishlistApi = {
  get: () => apiRequest('/wishlist/get'),
  add: (productId) => apiRequest('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  remove: (productId) => apiRequest('/wishlist/remove', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
};

// API functions for orders
export const ordersApi = {
  getById: (orderId) => apiRequest(`/orders/${orderId}`),
  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  getItemsByOrderId: (orderId) => apiRequest(`/orders/${orderId}/items`),
  getShippingInfo: (orderId) => apiRequest(`/orders/${orderId}/shipping`),
  updateStatus: (orderId, status) => apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  getUserOrders: () => apiRequest('/orders/my-orders'), // Added new function to match backend route
  cancelOrder: (orderId) => apiRequest(`/orders/${orderId}/cancel`, {
    method: 'POST',
  }),
};

// API functions for admin
export const adminApi = {
  // Dashboard
  getDashboard: () => apiRequest('/admin/dashboard'),
  getAnalytics: () => apiRequest('/admin/analytics'),
  
  // Users
  getAllUsers: () => apiRequest('/admin/users'),
  deleteUser: (userId) => apiRequest(`/admin/user/${userId}`, {
    method: 'DELETE',
  }),
  updateUserRole: (userId, role) => apiRequest(`/admin/user/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  
  // Sliders
  getAllSliders: () => apiRequest('/slider'),
  getSlider: (sliderId) => apiRequest(`/slider/edit/${sliderId}`),
  createSlider: (sliderData) => {
    // FormData needs to be handled specially
    const url = `${API_URL}/slider/add`;
    
    // Get auth token from localStorage if available
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
      method: 'POST',
      headers,
      body: sliderData,
    }).then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || data.message || 'An error occurred');
        });
      }
      return response.json();
    });
  },
  updateSlider: (sliderId, sliderData) => {
    // FormData needs to be handled specially
    const url = `${API_URL}/slider/edit/${sliderId}`;
    
    // Get auth token from localStorage if available
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
      method: 'PUT',
      headers,
      body: sliderData,
    }).then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || data.message || 'An error occurred');
        });
      }
      return response.json();
    });
  },
  deleteSlider: (sliderId) => apiRequest(`/slider/${sliderId}`, {
    method: 'DELETE',
  }),
  
  // Products
  getAllProducts: () => apiRequest('/admin/products'),
  getProduct: (productId) => apiRequest(`/admin/product/${productId}`),
  createProduct: (productData) => {
    // FormData needs to be handled specially
    const url = `${API_URL}/admin/product/new`;
    
    // Get auth token from localStorage if available
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
      method: 'POST',
      headers,
      body: productData,
    }).then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || data.message || 'An error occurred');
        });
      }
      return response.json();
    });
  },
  updateProduct: (productId, productData) => {
    // FormData needs to be handled specially
    const url = `${API_URL}/admin/product/${productId}`;
    
    // Get auth token from localStorage if available
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
      method: 'PUT',
      headers,
      body: productData,
    }).then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || data.message || 'An error occurred');
        });
      }
      return response.json();
    });
  },
  deleteProduct: (productId) => apiRequest(`/admin/product/${productId}/delete`, {
    method: 'DELETE',
  }),
  
  // Orders
  getAllOrders: () => apiRequest('/admin/orders'),
  getOrder: (orderId) => apiRequest(`/admin/order/${orderId}`),
  updateOrderStatus: (orderId, status) => apiRequest(`/admin/order/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  deleteOrder: (orderId) => apiRequest(`/admin/order/${orderId}`, {
    method: 'DELETE',
  }),
  
  // Messages/Contacts
  getMessages: () => apiRequest('/admin/messages'),
};

// API functions for offers
export const offersApi = {
  getAll: () => apiRequest('/offers'),
  getById: (id) => apiRequest(`/offers/${id}`),
  validateCode: (code) => apiRequest('/offers/validate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),
  create: (offerData) => apiRequest('/offers/add', {
    method: 'POST',
    body: JSON.stringify(offerData),
  }),
  update: (id, offerData) => apiRequest(`/offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(offerData),
  }),
  delete: (id) => apiRequest(`/offers/${id}`, {
    method: 'DELETE',
  }),
};

// API functions for categories
export const categoriesApi = {
  getAll: () => apiRequest('/products/categories'),
  getById: (idOrSlug) => apiRequest(`/products/categories/${idOrSlug}`),
  getSubcategories: (categoryId) => apiRequest(`/products/categories/${categoryId}/subcategories`),
  getCategoriesWithProducts: () => apiRequest('/products/categories-with-products'),
};

// API functions for reviews
export const reviewsApi = {
  getByProductId: (productId) => apiRequest(`/reviews/product/${productId}`),
  add: (review) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  }),
};

// API functions for brands
export const brandsApi = {
  getAll: () => apiRequest('/products/brands'),
};

// Payment services
export const paymentApi = {
  placeOrderCOD: (orderData) => apiRequest('/orders/place-order-COD', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  createRazorpayOrder: (orderData) => apiRequest('/orders/create-order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  captureRazorpayPayment: (paymentData) => apiRequest('/orders/capture-payment', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
};






export const getUserCart = (userId) => api.cart.get(userId);
export const addToCart = (userId, productId, quantity = 1) => api.cart.add(userId, productId, quantity);
export const updateCartItem = (userId, productId, quantity) => api.cart.update(userId, productId, quantity);
export const removeFromCart = (userId, productId) => api.cart.remove(userId, productId);
export const clearCart = (userId) => api.cart.clear(userId);

// Home page data service
export const getHomePageData = async () => {
  try {
    // Fetch data in parallel
    const [featuredProducts, newArrivals, onSaleProducts, allCategories, activeOffers] = await Promise.all([
      api.products.getFeatured(),
      api.products.getNewArrivals(),
      api.products.getOnSale(),
      api.categories.getAll(),
      api.offers.getAll()
    ]);

    return {
      featuredProducts,
      newArrivals,
      onSaleProducts,
      categories: allCategories,
      offers: activeOffers
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    throw error;
  }
};


export const getAllOffers = () => api.offers.getAll();
export const getAllCategories = () => api.categories.getAll();
export const placeOrderCOD = (orderData) => api.payment.placeOrderCOD(orderData);
export const createRazorpayOrder = (orderData) => api.payment.createRazorpayOrder(orderData);
export const captureRazorpayPayment = (paymentData) => api.payment.captureRazorpayPayment(paymentData);


// Combine all API services
export const api = {
  products: productsApi,
  auth: authApi,
  users: usersApi,
  cart: cartApi,
  wishlist: wishlistApi,
  orders: ordersApi,
  offers: offersApi,
  categories: categoriesApi,
  reviews: reviewsApi,
  brands: brandsApi,
  payment: paymentApi,
  admin: adminApi,
};

export default api;