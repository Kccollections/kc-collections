import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { toast } from 'react-hot-toast';
import api from '../../services/realApi';
import Modal from '../../components/ui/Modal';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    validFrom: '',
    validUntil: '',
    termsAndConditions: '',
    applicableProducts: []
  });

  // Fetch offers and products on component mount
  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await api.offers.getAll();
      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.admin.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'discountPercentage' ? parseFloat(value) || '' : value
    });
  };

  const handleProductSelection = (e, index) => {
    const selectedProductId = e.target.value;
    const updatedProducts = [...formData.applicableProducts];
    updatedProducts[index] = selectedProductId;
    setFormData({
      ...formData,
      applicableProducts: updatedProducts
    });
  };

  const addProductField = () => {
    setFormData({
      ...formData,
      applicableProducts: [...formData.applicableProducts, '']
    });
  };

  const removeProductField = (index) => {
    const updatedProducts = [...formData.applicableProducts];
    updatedProducts.splice(index, 1);
    setFormData({
      ...formData,
      applicableProducts: updatedProducts
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountPercentage: '',
      validFrom: '',
      validUntil: '',
      termsAndConditions: '',
      applicableProducts: ['']
    });
    setEditOfferId(null);
  };

  const showOfferForm = () => {
    resetForm();
    setShowModal(true);
  };

  const hideOfferForm = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Filter out empty product selections
      const validProducts = formData.applicableProducts.filter(id => id);
      
      const offerData = {
        ...formData,
        applicableProducts: validProducts
      };
      
      if (editOfferId) {
        // Update existing offer using API
        await api.offers.update(editOfferId, offerData);
        toast.success('Offer updated successfully!');
      } else {
        // Create new offer using API
        await api.offers.create(offerData);
        toast.success('Offer created successfully!');
      }
      
      hideOfferForm();
      fetchOffers(); // Refresh the offers list
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error.message || 'An error occurred while saving the offer');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOffer = async (offerId) => {
    try {
      setLoading(true);
      const offer = await api.offers.getById(offerId);
      
      // Format dates for the form
      const formattedOffer = {
        ...offer,
        validFrom: new Date(offer.validFrom).toISOString().split('T')[0],
        validUntil: new Date(offer.validUntil).toISOString().split('T')[0],
        applicableProducts: offer.applicableProducts.map(product => 
          typeof product === 'object' ? product._id : product
        )
      };
      
      setFormData(formattedOffer);
      setEditOfferId(offerId);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching offer details:', error);
      toast.error('Failed to fetch offer details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        setLoading(true);
        await api.offers.delete(offerId);
        toast.success('Offer deleted successfully!');
        fetchOffers(); // Refresh the offers list
      } catch (error) {
        console.error('Error deleting offer:', error);
        toast.error('Failed to delete offer');
      } finally {
        setLoading(false);
      }
    }
  };

  // Find product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Unknown Product';
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Offers</h1>
          <button
            onClick={showOfferForm}
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Add New Offer
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {!loading && offers.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No offers found. Create your first offer!</p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Period</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {offers.map((offer) => (
                        <tr key={offer._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                            <div className="text-sm text-gray-500">{offer.description.substring(0, 50)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{offer.discountPercentage}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validUntil).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {offer.applicableProducts && offer.applicableProducts.length > 0 ? (
                                <ul className="list-disc pl-5">
                                  {offer.applicableProducts.slice(0, 3).map((product, idx) => (
                                    <li key={idx} className="text-sm text-gray-500">
                                      {typeof product === 'object' ? product.name : getProductName(product)}
                                    </li>
                                  ))}
                                  {offer.applicableProducts.length > 3 && (
                                    <li className="text-sm text-gray-500">+{offer.applicableProducts.length - 3} more</li>
                                  )}
                                </ul>
                              ) : (
                                <span className="text-sm text-gray-500">No products selected</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {offer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditOffer(offer._id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Offer Modal */}
        <Modal
          isOpen={showModal}
          onClose={hideOfferForm}
          title={editOfferId ? 'Edit Offer' : 'Add New Offer'}
        >
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        required
                      ></textarea>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">Discount Percentage</label>
                      <input
                        type="number"
                        id="discountPercentage"
                        name="discountPercentage"
                        value={formData.discountPercentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">Valid From</label>
                        <input
                          type="date"
                          id="validFrom"
                          name="validFrom"
                          value={formData.validFrom}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">Valid Until</label>
                        <input
                          type="date"
                          id="validUntil"
                          name="validUntil"
                          value={formData.validUntil}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Products</label>
                      {formData.applicableProducts.length === 0 && (
                        <button
                          type="button"
                          onClick={addProductField}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Add Product
                        </button>
                      )}
                      {formData.applicableProducts.map((productId, index) => (
                        <div key={index} className="flex items-center mt-2">
                          <select
                            value={productId}
                            onChange={(e) => handleProductSelection(e, index)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          >
                            <option value="">Select a product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeProductField(index)}
                            className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {index === formData.applicableProducts.length - 1 && (
                            <button
                              type="button"
                              onClick={addProductField}
                              className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full text-green-600 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700">Terms and Conditions</label>
                      <textarea
                        id="termsAndConditions"
                        name="termsAndConditions"
                        value={formData.termsAndConditions}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      ></textarea>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-2 sm:text-sm"
                      >
                        {editOfferId ? 'Update Offer' : 'Create Offer'}
                      </button>
                      <button
                        type="button"
                        onClick={hideOfferForm}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
          </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;