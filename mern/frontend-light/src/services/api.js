import { api } from '../config/apiConfig';

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

// Product details page data service
export const getProductDetailsPageData = async (productId) => {
  try {
    const [product, relatedProducts, reviews] = await Promise.all([
      api.products.getById(productId),
      api.products.getRelated(productId),
      api.reviews.getByProductId(productId)
    ]);

    return {
      product,
      relatedProducts,
      reviews
    };
  } catch (error) {
    console.error('Error fetching product details page data:', error);
    throw error;
  }
};

// Category page data service
export const getCategoryPageData = async (categoryId) => {
  try {
    const [category, products, subcategories] = await Promise.all([
      api.categories.getById(categoryId),
      api.products.getByCategory(categoryId),
      api.categories.getSubcategories(categoryId)
    ]);

    return {
      category,
      products,
      subcategories
    };
  } catch (error) {
    console.error('Error fetching category page data:', error);
    throw error;
  }
};

// User dashboard page data service
export const getUserDashboardData = async (userId) => {
  try {
    const [profile, orders, wishlist, addresses] = await Promise.all([
      api.auth.getUserProfile(userId),
      api.users.getOrders(userId),
      api.users.getWishlist(userId),
      api.users.getAddresses(userId)
    ]);

    return {
      profile,
      orders,
      wishlist,
      addresses
    };
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    throw error;
  }
};

// Checkout page data service
export const getCheckoutPageData = async (userId) => {
  try {
    const [cart, addresses, paymentMethods] = await Promise.all([
      api.cart.get(userId),
      api.users.getAddresses(userId),
      api.users.getPaymentMethods(userId)
    ]);

    return {
      cart,
      addresses,
      paymentMethods
    };
  } catch (error) {
    console.error('Error fetching checkout page data:', error);
    throw error;
  }
};

// Shop page data service
export const getShopPageData = async (filters = {}) => {
  try {
    const [products, categories, brands, priceRange] = await Promise.all([
      api.products.getFiltered(filters),
      api.categories.getAll(),
      api.brands.getAll(),
      api.products.getPriceRange()
    ]);

    return {
      products,
      categories,
      brands,
      priceRange
    };
  } catch (error) {
    console.error('Error fetching shop page data:', error);
    throw error;
  }
};

// Order details page data service
export const getOrderDetailsPageData = async (orderId) => {
  try {
    const [order, orderItems, shippingInfo] = await Promise.all([
      api.orders.getById(orderId),
      api.orders.getItemsByOrderId(orderId),
      api.orders.getShippingInfo(orderId)
    ]);

    return {
      order,
      orderItems,
      shippingInfo
    };
  } catch (error) {
    console.error('Error fetching order details page data:', error);
    throw error;
  }
};

// Wishlist page data service
export const getWishlistPageData = async (userId) => {
  try {
    const [wishlistItems, recommendations] = await Promise.all([
      api.users.getWishlist(userId),
      api.products.getRecommended(userId)
    ]);

    return {
      wishlistItems,
      recommendations
    };
  } catch (error) {
    console.error('Error fetching wishlist page data:', error);
    throw error;
  }
};

// Product services
export const getAllProducts = () => api.products.getAll();
export const getProductById = (id) => api.products.getById(id);
export const getProductsByCategory = (category) => api.products.getByCategory(category);
export const searchProducts = (query) => api.products.search(query);

// Category services
export const getAllCategories = () => api.categories.getAll();
export const getCategoryById = (idOrSlug) => api.categories.getById(idOrSlug);

// User services
export const loginUser = (email, password) => api.auth.login(email, password);
export const getUserProfile = (userId) => api.auth.getUserProfile(userId);
export const getUserAddresses = (userId) => api.users.getAddresses(userId);
export const getUserOrders = (userId) => api.users.getOrders(userId);

// Wishlist services
export const getUserWishlist = (userId) => api.users.getWishlist(userId);
export const addToWishlist = (userId, productId) => api.users.addToWishlist(userId, productId);
export const removeFromWishlist = (userId, productId) => api.users.removeFromWishlist(userId, productId);

// Cart services
export const getUserCart = (userId) => api.cart.get(userId);
export const addToCart = (userId, productId, quantity = 1) => api.cart.add(userId, productId, quantity);
export const updateCartItem = (userId, productId, quantity) => api.cart.update(userId, productId, quantity);
export const removeFromCart = (userId, productId) => api.cart.remove(userId, productId);
export const clearCart = (userId) => api.cart.clear(userId);

// Order services
export const getOrderById = (orderId) => api.orders.getById(orderId);

// Offer services
export const getAllOffers = () => api.offers.getAll();
export const getOfferById = (id) => api.offers.getById(id);

// Review services
export const getReviewsByProductId = (productId) => api.reviews.getByProductId(productId);
export const addReview = (review) => api.reviews.add(review);

// Payment services
export const placeOrderCOD = (orderData) => api.payment.placeOrderCOD(orderData);
export const createRazorpayOrder = (orderData) => api.payment.createRazorpayOrder(orderData);
export const captureRazorpayPayment = (paymentData) => api.payment.captureRazorpayPayment(paymentData);