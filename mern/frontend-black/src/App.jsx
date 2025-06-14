import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import React from 'react';

// Public pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
// import ProductPage from './pages/ProductPage';  
import ProductDetailsPage from './pages/ProductDetailsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import OfferPage from './pages/OfferPage';
import ReturnsPage from './pages/ReturnsPage';

// Protected user pages
import AccountPage from './pages/user/AccountPage';
import OrdersPage from './pages/user/OrdersPage';
import OrderDetailsPage from './pages/user/OrderDetailsPage';
import OrderConfirmationPage from './pages/user/OrderConfirmationPage';
import WishlistPage from './pages/user/WishlistPage';
import AddressPage from './pages/user/AddressPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminOffers from './pages/admin/Offers';
import AdminSliders from './pages/admin/Sliders';


// Auth provider
import { AuthProvider } from './context/AuthContext';
// Cart provider
import { CartProvider } from './context/CartContext';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Something went wrong</h2>
              <p className="mt-2 text-sm text-gray-600">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <p className="font-medium text-red-600 mb-2">Error details:</p>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking if all resources are loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading KC Collection...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-center" />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              {/* <Route path="/products/:id" element={<ProductPage />} /> */}
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/offers" element={<OfferPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              
              {/* User protected routes */}
              <Route path="/user/account" element={<AccountPage />} />
              <Route path="/user/orders" element={<OrdersPage />} />
              <Route path="/user/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/user/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/user/wishlist" element={<WishlistPage />} />
              <Route path="/user/address" element={<AddressPage />} />
              <Route path="/user/cart" element={<CartPage />} />
              <Route path="/user/checkout" element={<CheckoutPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/sliders" element={<AdminSliders />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/offers" element={<AdminOffers />} />
              
              {/* 404 - If we make it here, nothing matched */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-purple-600">404</h1>
                    <h2 className="text-3xl font-medium mt-4">Page Not Found</h2>
                    <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
                    <div className="mt-6">
                      <a 
                        href="/" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Go back home
                      </a>
                    </div>
                  </div>
                </div>
              } />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
