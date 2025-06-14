import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../services/realApi';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: `/orders/${id}` } }} replace />;
  }

  // Function to check if the order is eligible for cancellation (within 24 hours of placement)
  const isEligibleForCancellation = (orderDate) => {
    if (!orderDate) return false;
    
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const hoursSincePlacement = (currentTime - orderTime) / (1000 * 60 * 60);
    
    // Check if order status allows cancellation
    const statusAllowsCancellation = 
      orderDetails.status?.toLowerCase() !== 'cancelled' && 
      orderDetails.status?.toLowerCase() !== 'delivered' && 
      orderDetails.status?.toLowerCase() !== 'shipped';
    
    return hoursSincePlacement <= 24 && statusAllowsCancellation;
  };

  // Function to check if the order is eligible for return (within 24 hours of delivery)
  const isEligibleForReturn = (deliveryDate) => {
    if (!deliveryDate) return false;
    
    const deliveryTime = new Date(deliveryDate).getTime();
    const currentTime = new Date().getTime();
    const hoursSinceDelivery = (currentTime - deliveryTime) / (1000 * 60 * 60);
    
    // Check if order is delivered
    const isDelivered = orderDetails.status?.toLowerCase() === 'delivered';
    
    return hoursSinceDelivery <= 24 && isDelivered;
  };

  // Function to cancel the order
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellationLoading(true);
      const response = await ordersApi.cancelOrder(id);
      
      if (response.success) {
        setActionMessage({ type: 'success', text: 'Order cancelled successfully!' });
        // Update the order status
        setOrderDetails(prev => ({
          ...prev,
          status: 'Cancelled'
        }));
      } else {
        setActionMessage({ type: 'error', text: response.message || 'Failed to cancel order.' });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      console.error('Error cancelling order:', error);
    } finally {
      setCancellationLoading(false);
    }
  };

  // Function to initiate a return
  const handleReturnOrder = () => {
    navigate(`/returns/request/${id}`);
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const order = await ordersApi.getById(id);
        
        if (!order) {
          setError('Order not found');
          return;
        }
        
        // Format the order data for display
        const formattedOrder = {
          id: order._id,
          date: new Date(order.createdAt || order.orderDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          orderDate: order.createdAt || order.orderDate, // Keep raw date for calculations
          total: order.totalAmount,
          subtotal: order.subtotal || order.totalAmount * 0.93, // Estimate if not provided
          shipping: order.shippingCost || 0,
          tax: order.tax || order.totalAmount * 0.07, // Estimate if not provided
          status: order.shippingStatus || order.status || 'Processing',
          paymentMethod: order.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment',
          shippingAddress: order.address ? {
            name: order.address.name,
            street: order.address.streetAddress,
            city: order.address.city,
            state: order.address.state,
            zip: order.address.postalCode,
            country: order.address.country
          } : null,
          items: order.items.map(item => ({
            id: item.productId?._id || item.productId,
            name: item.productId?.name || 'Product',
            price: item.productId?.price || 0,
            quantity: item.quantity || 1,
            image: item.productId?.images?.[0] || '/assets/placeholder.png'
          })),
          timeline: [
            {
              status: 'Order Placed',
              date: new Date(order.createdAt || order.orderDate).toLocaleDateString(),
              time: new Date(order.createdAt || order.orderDate).toLocaleTimeString()
            }
          ]
        };
        
        // Add shipping info to timeline if available
        if (order.shippingDate) {
          formattedOrder.timeline.push({
            status: 'Shipped',
            date: new Date(order.shippingDate).toLocaleDateString(),
            time: new Date(order.shippingDate).toLocaleTimeString()
          });
        }
        
        // Add delivery info to timeline if available
        if (order.deliveryDate) {
          formattedOrder.deliveryDate = order.deliveryDate; // Keep raw date for calculations
          formattedOrder.timeline.push({
            status: 'Delivered',
            date: new Date(order.deliveryDate).toLocaleDateString(),
            time: new Date(order.deliveryDate).toLocaleTimeString()
          });
        }
        
        // Add tracking info if available
        if (order.trackingId) {
          formattedOrder.trackingId = order.trackingId;
          formattedOrder.trackingUrl = order.trackingUrl;
        }
        
        setOrderDetails(formattedOrder);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchOrderDetails();
    }
  }, [id, user]);

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/user/orders" className="text-purple-600 hover:text-purple-700 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </Link>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !orderDetails) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/user/orders" className="text-purple-600 hover:text-purple-700 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error || 'Order not found'}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/user/orders" className="text-purple-600 hover:text-purple-700 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>
        </div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Order #{orderDetails.id}</h1>
            <p className="text-gray-600">Placed on {orderDetails.date}</p>
          </div>
          <div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(orderDetails.status)}`}>
              {orderDetails.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-base font-medium text-gray-900">
                            <Link to={`/product/${item.id}`}>
                              {item.name}
                            </Link>
                          </h3>
                          <p className="ml-4 text-base font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {orderDetails.timeline && orderDetails.timeline.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Order Timeline</h2>
                </div>
                <div className="p-4">
                  <div className="relative">
                    {orderDetails.timeline.map((event, index) => (
                      <div key={index} className="flex items-start mb-6 relative">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-600 text-white text-sm font-medium z-10">
                          {index + 1}
                        </div>
                        {index < orderDetails.timeline.length - 1 && (
                          <div className="absolute top-8 bottom-0 left-4 w-0.5 bg-gray-200 -z-10 h-full"></div>
                        )}
                        <div className="ml-4">
                          <h3 className="text-base font-medium">{event.status}</h3>
                          <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tracking Information */}
            {orderDetails.trackingId && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Tracking Information</h2>
                </div>
                <div className="p-4">
                  <p className="mb-2"><span className="font-medium">Tracking ID:</span> {orderDetails.trackingId}</p>
                  {orderDetails.trackingUrl && (
                    <a 
                      href={orderDetails.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                    >
                      Track Your Order
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary Column */}
          <div>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Order Summary</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">${orderDetails.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-medium">${orderDetails.shipping.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Tax</p>
                    <p className="font-medium">${orderDetails.tax.toFixed(2)}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <p className="text-lg font-medium">Total</p>
                      <p className="text-lg font-medium">${orderDetails.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {orderDetails.shippingAddress && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Shipping Address</h2>
                </div>
                <div className="p-4">
                  <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zip}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Payment Information</h2>
              </div>
              <div className="p-4">
                <p>{orderDetails.paymentMethod}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-4">
              {isEligibleForCancellation(orderDetails.orderDate) && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  disabled={cancellationLoading}
                >
                  {cancellationLoading ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              {isEligibleForReturn(orderDetails.deliveryDate) && (
                <button
                  onClick={handleReturnOrder}
                  className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
                >
                  Return Order
                </button>
              )}
              {actionMessage && (
                <div className={`p-4 rounded ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {actionMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetailsPage;