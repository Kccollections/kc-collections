import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../config/apiConfig';
import { toast } from 'react-hot-toast';

const AddressPage = ({ isCheckout = false, onSelectAddress = null }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const initialFormState = {
    type: 'Home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    default: false
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.users.getAddresses();
        const formattedAddresses = response.data.map(addr => ({
          id: addr._id,
          type: 'Home',
          name: addr.name,
          phone: addr.mobile,
          street: addr.streetAddress,
          city: addr.city,
          state: addr.state,
          zipCode: addr.postalCode,
          country: addr.country,
          default: addr.isDefault
        }));
        setAddresses(formattedAddresses);
      } catch (error) {
        toast.error('Failed to load addresses');
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses(); // Call the function to fetch addresses
  }, [user]);

  // Select default address initially in checkout mode
  React.useEffect(() => {
    if (isCheckout && onSelectAddress && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.default) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
      if (onSelectAddress) {
        onSelectAddress(defaultAddress);
      }
    }
  }, [isCheckout, addresses, onSelectAddress]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        // Update existing address
        const response = await api.users.updateAddress(editingAddress.id, formData);
        
        if (response) {
          const updatedAddress = {
            id: response._id,
            type: 'Home',
            name: response.name,
            phone: response.mobile,
            street: response.streetAddress,
            city: response.city,
            state: response.state,
            zipCode: response.postalCode,
            country: response.country,
            default: response.isDefault
          };
          
          const updatedAddresses = addresses.map(address =>
            address.id === editingAddress.id ? updatedAddress : address
          );
          
          setAddresses(updatedAddresses);
          setEditingAddress(null);
          
          // Update selected address for checkout if this was selected
          if (selectedAddressId === editingAddress.id && onSelectAddress) {
            onSelectAddress(updatedAddress);
          }
          
          toast.success('Address updated successfully');
        }
      } else {
        // Add new address
        const response = await api.users.addAddress(formData);
        
        if (response) {
          const newAddress = {
            id: response._id,
            type: 'Home',
            name: response.name,
            phone: response.mobile,
            street: response.streetAddress,
            city: response.city,
            state: response.state,
            zipCode: response.postalCode,
            country: response.country,
            default: response.isDefault
          };
          
          setAddresses([...addresses, newAddress]);
          
          // If in checkout and this is the first address, select it
          if (isCheckout && addresses.length === 0) {
            setSelectedAddressId(newAddress.id);
            if (onSelectAddress) {
              onSelectAddress(newAddress);
            }
          }
          
          toast.success('Address added successfully');
        }
      }
      
      // Reset form
      setFormData(initialFormState);
      setShowAddForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save address');
      console.error('Error saving address:', error);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      default: address.default
    });
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (id) => {
    // Don't allow deleting the selected address in checkout
    if (isCheckout && id === selectedAddressId) {
      alert("Cannot delete the currently selected address");
      return;
    }
    
    try {
      await api.users.deleteAddress(id);
      setAddresses(addresses.filter(address => address.id !== id));
      
      // If the deleted address was selected in checkout, select another one
      if (isCheckout && id === selectedAddressId && addresses.length > 1) {
        const newSelected = addresses.find(addr => addr.id !== id);
        if (newSelected && onSelectAddress) {
          setSelectedAddressId(newSelected.id);
          onSelectAddress(newSelected);
        }
      }
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map(address => ({
      ...address,
      default: address.id === id
    }));
    
    setAddresses(updatedAddresses);
  };
  
  const handleSelectAddress = (address) => {
    if (isCheckout && onSelectAddress) {
      setSelectedAddressId(address.id);
      onSelectAddress(address);
    }
  };

  return (
    <div className={isCheckout ? "" : "container mx-auto px-4 py-8"}>
      <div className="flex justify-between items-center mb-6">
        {!isCheckout && <h1 className="text-2xl font-semibold">My Addresses</h1>}
        {!showAddForm && (
          <button
            onClick={() => {
              setFormData(initialFormState);
              setEditingAddress(null);
              setShowAddForm(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Address
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          
          <form onSubmit={handleAddressSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="India">India</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="default"
                name="default"
                checked={formData.default}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="default" className="ml-2 block text-sm text-gray-900">
                Set as default address
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
          {addresses.map((address) => (
            <div 
              key={address.id} 
              onClick={() => handleSelectAddress(address)}
              className={`bg-white rounded-lg shadow-md p-5 border cursor-pointer w-80 flex-shrink-0 ${
                isCheckout && selectedAddressId === address.id 
                  ? 'border-purple-600 ring-2 ring-purple-600' 
                  : address.default ? 'border-primary' : 'border-transparent'
              } ${isCheckout ? 'hover:border-purple-600' : ''}`}
            >
              {isCheckout && selectedAddressId === address.id && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  Selected
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="text-lg font-medium">{address.type}</span>
                  {address.default && (
                    <span className="ml-2 bg-primary-dark text-white text-xs px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(address);
                    }}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    Edit
                  </button>
                  {!address.default && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1 text-gray-800">
                <p className="font-medium">{address.name}</p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
                <p className="pt-1">{address.phone}</p>
              </div>
              
              {!address.default && !isCheckout && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault(address.id);
                  }}
                  className="mt-4 text-sm text-primary border border-primary px-3 py-1 rounded hover:bg-primary hover:text-white"
                >
                  Set as Default
                </button>
              )}
              
              {isCheckout && selectedAddressId !== address.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAddress(address);
                  }}
                  className="mt-4 text-sm bg-purple-100 text-purple-700 border border-purple-300 px-3 py-1 rounded hover:bg-purple-200"
                >
                  Use this address
                </button>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressPage;