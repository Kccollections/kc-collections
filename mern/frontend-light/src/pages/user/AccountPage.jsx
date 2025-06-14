import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../constraint';
import AddressPage from './AddressPage';
import WishlistPage from './WishlistPage';
import OrdersPage from './OrdersPage';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    profile: null,
    orders: [],
    addresses: [],
    wishlist: []
  });
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'home',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: '/user/account' } }} replace />;
  }

  // Use effect to load user data based on active tab
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Set default profile data from user object
        setUserData(prev => ({
          ...prev,
          profile: {
            ...user,
            // Add any additional fields needed
            phone: user.phone || ''
          }
        }));
        
        // Fetch addresses when addresses tab is active or on initial load
        if (activeTab === 'addresses' || !userData.addresses.length) {
          const addresses = await api.users.getAddresses(user.id);
          setUserData(prev => ({
            ...prev,
            addresses: addresses || []
          }));
        }
      } catch (error) {
        console.error(`Error fetching user data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, activeTab]);

  const handleLogout = () => {
    logout();
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAddress = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to save the address
    // For now, we'll just add it to the local state
    const newAddressItem = {
      id: `addr-${Date.now()}`,
      default: userData.addresses.length === 0,
      ...newAddress
    };
    
    setUserData(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddressItem]
    }));
    
    setShowAddressForm(false);
    setNewAddress({
      type: 'home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: ''
    });
  };

  const handleSetDefaultAddress = (addressId) => {
    const updatedAddresses = userData.addresses.map(addr => ({
      ...addr,
      default: addr.id === addressId
    }));
    
    setUserData(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
  };

  const handleDeleteAddress = (addressId) => {
    const updatedAddresses = userData.addresses.filter(addr => addr.id !== addressId);
    
    // If we deleted the default address, make the first one the new default
    if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.default)) {
      updatedAddresses[0].default = true;
    }
    
    setUserData(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="h-14 w-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {user?.name?.charAt(0) || '?'}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-lg">{user?.name || 'User'}</p>
                  <p className="text-gray-500">{user?.email || ''}</p>
                </div>
              </div>
              
              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full text-left py-2 px-3 rounded-md ${
                        activeTab === 'profile'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Personal Information
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full text-left py-2 px-3 rounded-md ${
                        activeTab === 'orders'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Order History
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className={`w-full text-left py-2 px-3 rounded-md ${
                        activeTab === 'addresses'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Addresses
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className={`w-full text-left py-2 px-3 rounded-md ${
                        activeTab === 'wishlist'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Wishlist
                    </button>
                  </li>
                  {/* <li>
                    <button
                      onClick={() => setActiveTab('security')}
                      className={`w-full text-left py-2 px-3 rounded-md ${
                        activeTab === 'security'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Security
                    </button>
                  </li> */}
                </ul>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button 
                  onClick={handleLogout} 
                  variant="outline"
                  fullWidth
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-24 bg-gray-200 rounded w-full"></div>
                </div>
              ) : (
                <>
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                      
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              defaultValue={userData.profile?.name || ''}
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 read-only:"
                            />
                          </div>
                          
                          
                        </div>
                        
                        <div>
  <label className="block text-gray-700 text-sm font-medium mb-1 ">
    Email Address
  </label>
  <input
    type="email"
    defaultValue={userData.profile?.email || ''}
    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 read-only:"
    readOnly
  />
</div>

<div>
  <label className="block text-gray-700 text-sm font-medium mb-1 read-only:">
    Phone Number
  </label>
  <input
    type="tel"
    defaultValue={userData.profile?.mobile || ''}
    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 read-only:"
    readOnly
  />
</div>

<div>
  {/* <Button type="submit">
    Update Profile
  </Button> */}
</div>

                      </form>
                    </div>
                  )}

                  {/* Orders Tab */}
                  {activeTab === 'orders' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Order History</h2>
                      <div className="orders-container">
                        {/* Use the OrdersPage component, but only the inner content */}
                        <div className="orders-wrapper">
                          <OrdersPage embedded={true} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Addresses Tab */}
                  {activeTab === 'addresses' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Your Addresses</h2>
                      <div className="space-y-4">
                        <AddressPage/>
                      </div>
                    </div>
                  )}
                  
                  {/* Wishlist Tab */}
                  {activeTab === 'wishlist' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Your Wishlist</h2>
                      <div className="text-center py-8 text-gray-500">
                        <WishlistPage/>
                        <div className="mt-4">
                          <Link to="/shop">
                            <Button>Explore Products</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* {activeTab === 'security' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Security</h2>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        <div>
                          <Button type="submit">
                            Update Password
                          </Button>
                        </div>
                      </form>
                    </div>
                  )} */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountPage;