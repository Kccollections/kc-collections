import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const OrderConfirmationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [orderData, setOrderData] = useState(null);
  
  // Get order data from location state or create mock data as fallback
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Try to get order data from location state
      const orderDetails = location.state?.orderDetails || {
        id: Math.floor(100000 + Math.random() * 900000).toString(),
        date: new Date().toISOString(),
        shippingAddress: user ? {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          address: user.address || '123 Main Street',
          city: user.city || 'New York',
          state: user.state || 'NY',
          zipCode: user.zipCode || '10001',
          country: user.country || 'United States'
        } : {
          name: 'Customer',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        items: location.state?.cartItems || [],
        paymentMethod: location.state?.paymentMethod || 'Cash on Delivery',
        subtotal: location.state?.subtotal || 0,
        shipping: location.state?.shipping || 0,
        tax: location.state?.tax || 0,
        total: location.state?.total || 0,
        estimatedDelivery: '3-5 business days'
      };
      
      setOrderData(orderDetails);
      setIsLoading(false);
      
      // Scroll to top of page
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error loading order data:', err);
      setError('Failed to load order confirmation');
      setIsLoading(false);
    }
  }, [location.state, user]);
  
  // Countdown timer to redirect to homepage
  useEffect(() => {
    if (!isLoading && !error) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLoading, error, navigate]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
            <p>{error}</p>
            <div className="mt-4">
              <Button as={Link} to="/user/orders">View Your Orders</Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Green success message box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">Order Confirmed!</h1>
              <p className="text-green-600 mb-2">
                Thank you for your purchase. Your order has been received and is being processed.
              </p>
              <p className="text-sm text-gray-600">Redirecting to homepage in {countdown} seconds...</p>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">Order #{orderData.id}</h2>
                  <p className="text-gray-600 text-sm">Placed on {formatDate(orderData.date)}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <h3 className="font-medium mb-3">Items in your order</h3>
              <div className="space-y-4 mb-6">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex items-start">
                    <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-600 text-sm">Quantity: {item.quantity}</div>
                      <div className="text-gray-800">${item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="font-medium mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{orderData.shipping === 0 ? 'Free' : `$${orderData.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold">Shipping Information</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-1">
                <p className="font-medium">{orderData.shippingAddress.name}</p>
                <p>{orderData.shippingAddress.address}</p>
                <p>
                  {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}
                </p>
                <p>{orderData.shippingAddress.country}</p>
              </div>
              <div className="mt-4 text-gray-600">
                <p>Estimated delivery: {orderData.estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderConfirmationPage;