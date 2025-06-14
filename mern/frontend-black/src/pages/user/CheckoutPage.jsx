import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getUserCart, placeOrderCOD, createRazorpayOrder, captureRazorpayPayment } from '../../services/realApi';
import AddressPage from './AddressPage';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'cod' // Default payment method
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Update address information when user selects an address
  useEffect(() => {
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        address: selectedAddress.street || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        zipCode: selectedAddress.zipCode || '',
        country: selectedAddress.country || 'United States',
      }));
    }
  }, [selectedAddress]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      navigate('/user/cart');
    }
  }, [cart, navigate, orderSuccess]);

  if (cart.length === 0 && !orderSuccess) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    console.log("Selected address:", address);
  };

  const nextStep = () => {
    // Only proceed if address is selected
    if (!selectedAddress && step === 1) {
      alert("Please select an address to continue");
      return;
    }
    setStep(prevStep => prevStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrderCOD = async () => {
    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create order data to send to the backend
      const orderData = {
        items: cart,
        totalAmount: getSubtotal() + (getSubtotal() * 0.08),
        addressId: selectedAddress.id
      };

      console.log("Placing COD order with data:", orderData);
      
      // Call API to place order
      const response = await placeOrderCOD(orderData);
      
      if (response.success) {
        setOrderSuccess(true);
        // Even if shipment creation failed, we can still proceed with the order
        const orderDetails = {
          id: response.orderId || response.order._id || Math.floor(100000 + Math.random() * 900000).toString(),
          date: new Date().toISOString(),
          shippingAddress: {
            name: selectedAddress.name,
            address: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.zipCode,
            country: selectedAddress.country
          },
          paymentMethod: 'Cash on Delivery',
          subtotal: getSubtotal(),
          shipping: 0,
          tax: getSubtotal() * 0.08,
          total: getSubtotal() + (getSubtotal() * 0.08),
          items: cart,
          // If shipment was created, we might have tracking info
          trackingInfo: response.order?.trackingId ? {
            trackingId: response.order.trackingId,
            trackingUrl: response.order.trackingUrl
          } : null
        };
        
        clearCart();
        navigate('/user/order-confirmation', { 
          state: { 
            orderDetails,
            cartItems: cart,
          }
        });
      } else {
        alert(response.message || 'Failed to place the order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create order data for Razorpay
      const orderData = {
        items: cart,
        totalAmount: getSubtotal() + (getSubtotal() * 0.08),
        addressId: selectedAddress.id
      };
      
      console.log("Creating online payment order with data:", orderData);
      
      // Create Razorpay order
      const response = await createRazorpayOrder(orderData);
      
      if (response && response.orderId) {
        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await loadRazorpayScript();
        }
        
        // Configure Razorpay options
        const options = {
          key: 'rzp_test_yIZJEB6YyYUQ90', // Should come from environment variables
          amount: Math.round(orderData.totalAmount * 100), // Convert to smallest currency unit
          currency: 'INR',
          name: 'KC Collections',
          description: 'Purchase from KC Collections',
          order_id: response.orderId,
          handler: async function(paymentResponse) {
            try {
              const captureResponse = await captureRazorpayPayment(paymentResponse);
              
              if (captureResponse && captureResponse.success) {
                setOrderSuccess(true);
                const orderDetails = {
                  id: response.orderId,
                  date: new Date().toISOString(),
                  shippingAddress: {
                    name: selectedAddress.name,
                    address: selectedAddress.street,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    country: selectedAddress.country
                  },
                  paymentMethod: 'Online Payment (Razorpay)',
                  subtotal: getSubtotal(),
                  shipping: 0,
                  tax: getSubtotal() * 0.08,
                  total: getSubtotal() + (getSubtotal() * 0.08),
                  items: cart
                };
                
                clearCart();
                navigate('/user/order-confirmation', { 
                  state: { 
                    orderDetails,
                    cartItems: cart,
                  }
                });
              } else {
                alert(captureResponse.message || 'Payment verification failed. Please contact support.');
              }
            } catch (error) {
              console.error('Error capturing payment:', error);
              alert('Failed to verify payment. Please contact support.');
            }
          },
          prefill: {
            name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            email: user?.email || '',
            contact: user?.phone || ''
          },
          theme: {
            color: '#6B46C1'
          }
        };
        
        // Initialize Razorpay
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        alert(response?.message || 'Failed to create payment order. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating online payment:', error);
      alert('An error occurred while initiating payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
        alert('Failed to load Razorpay. Please check your connection.');
      };
      document.body.appendChild(script);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.paymentMethod === 'cod') {
      handlePlaceOrderCOD();
    } else {
      handlePayOnline();
    }
  };

  const renderShippingForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
      <AddressPage isCheckout={true} onSelectAddress={handleAddressSelect} />
      
      <div className="flex justify-end">
        <Button onClick={nextStep}>Continue to Payment</Button>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className="flex items-center space-x-2">
          <input 
            type="radio" 
            id="cod" 
            name="paymentMethod" 
            value="cod"
            checked={formData.paymentMethod === 'cod'}
            onChange={handleChange}
            className="h-4 w-4 text-purple-600"
          />
          <label htmlFor="cod" className="text-gray-700">Place Order for CoD</label>
        </div>
        <div className="flex items-center space-x-2">
          <input 
            type="radio" 
            id="online" 
            name="paymentMethod" 
            value="online"
            checked={formData.paymentMethod === 'online'}
            onChange={handleChange}
            className="h-4 w-4 text-purple-600"
          />
          <label htmlFor="online" className="text-gray-700">Place Order for Online</label>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="secondary" onClick={prevStep}>
          Back to Shipping
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Complete Order'}
        </Button>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-4 mb-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              <p className="text-gray-800">${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>${getSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span>${(getSubtotal() * 0.08).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${(getSubtotal() + getSubtotal() * 0.08).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`h-1 flex-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="text-sm font-medium">Shipping</div>
            <div className="text-sm font-medium">Payment</div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit}>
                {step === 1 && renderShippingForm()}
                {step === 2 && renderPaymentForm()}
              </form>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            {renderOrderSummary()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;