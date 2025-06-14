import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import CartItem from '../../components/cart/CartItem';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getUserCart } from '../../services/realApi';

const CartPage = () => {
  const { user, logout } = useAuth();
  const { cart, clearCart, getSubtotal, getItemCount } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch cart data from API
        const cartData = await getUserCart(user.id);
        // Note: In a real implementation, this would update the cart context
        // but for now we'll continue using the context state directly
      } catch (error) {
        console.error('Error fetching cart:', error);
        
        // Handle authentication errors
        if (error.message?.includes('Invalid token') || 
            error.message?.includes('No token provided') ||
            error.response?.status === 401) {
          
          setError('Your session has expired. Please log in again.');
          // Optional: Log the user out if token is invalid
          logout();
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, logout, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Shopping Cart</h1>
          <div className="animate-pulse space-y-6">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3">
                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                  {Array(3).fill().map((_, idx) => (
                    <div key={idx} className="flex py-6 border-b border-gray-200">
                      <div className="h-24 w-24 bg-gray-200 rounded-md"></div>
                      <div className="ml-4 flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <svg 
              className="mx-auto h-16 w-16 text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Authentication Error</h2>
            <p className="mt-2 text-gray-500">{error}</p>
            <div className="mt-6">
              <Button as={Link} to="/login">
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <svg 
              className="mx-auto h-16 w-16 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-500">Looks like you haven't added any items to your cart yet.</p>
            <div className="mt-6">
              <Button as={Link} to="/shop">
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <li key={item.id} className="py-4">
                        <CartItem item={item} />
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Button 
                    onClick={clearCart} 
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                
                <div className="flow-root">
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Subtotal ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})</dt>
                      <dd className="font-medium">${getSubtotal().toFixed(2)}</dd>
                    </div>
                    
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Shipping</dt>
                      <dd className="font-medium">Free</dd>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <dt className="font-bold">Total</dt>
                      <dd className="font-bold">${getSubtotal().toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="mt-6">
                  <Button 
                    as={Link} 
                    to="/user/checkout" 
                    fullWidth
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
                
                <div className="mt-4 text-center">
                  <Link to="/shop" className="text-sm text-purple-600 hover:text-purple-700">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;