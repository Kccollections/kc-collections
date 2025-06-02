import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import Modal from '../../components/ui/Modal';
import { api } from '../../services/realApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState({});
  
  // Product form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    startingPrice: '',
    description: '',
    brand: '',
    stock: '',
    material: '',
    weight: '',
    dimensions: '',
    color: '',
    attentionLevel: 'Normal',
    images: []
  });

  // State to store image previews
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Get products from the real API
      const data = await api.admin.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
      
      // Initialize active image index for each product
      const initialActiveImageIndex = {};
      if (Array.isArray(data)) {
        data.forEach(product => {
          initialActiveImageIndex[product._id] = 0;
        });
      }
      setActiveImageIndex(initialActiveImageIndex);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'startingPrice' || name === 'stock' 
        ? parseFloat(value) || '' 
        : value
    });
  };

  // Function to handle file changes with preview
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Set the files in the formData state
    setFormData({
      ...formData,
      images: files
    });
    
    // Create preview URLs for the images
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          productData.append(key, formData[key]);
        }
      });
      
      // Append images
      formData.images.forEach(image => {
        productData.append('images', image);
      });
      
      if (selectedProduct) {
        // Update existing product
        await api.admin.updateProduct(selectedProduct._id, productData);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await api.admin.createProduct(productData);
        toast.success('Product added successfully');
      }
      
      // Close modal and refresh product list
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(selectedProduct ? 'Failed to update product' : 'Failed to add product');
    }
  };

  const handleEdit = async (productId) => {
    try {
      setLoading(true);
      // Fetch the product details from API
      const product = await api.admin.getProduct(productId);
      
      setSelectedProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price || 0,
        startingPrice: product.startingPrice || product.price || 0,
        description: product.description || '',
        brand: product.brand || '',
        stock: product.stock || 0,
        material: product.material || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        color: product.color || '',
        attentionLevel: product.attentionLevel || 'Normal',
        images: [] // Can't pre-fill file inputs but we'll show existing images
      });
      
      // Create preview URLs for existing images
      if (product.images && product.images.length > 0) {
        const existingImagePreviews = product.images.map(imagePath => {
          // Check if the image path is a full URL or a relative path
          if (imagePath.includes('http')) {
            return imagePath;
          } else {
            return `/uploads/${imagePath}`;
          }
        });
        setImagePreviews(existingImagePreviews);
      } else {
        setImagePreviews([]);
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.admin.deleteProduct(productId);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      startingPrice: '',
      description: '',
      brand: '',
      stock: '',
      material: '',
      weight: '',
      dimensions: '',
      color: '',
      attentionLevel: 'Normal',
      images: []
    });
    setSelectedProduct(null);
  };

  const openAddProductModal = () => {
    resetForm();
    setShowModal(true);
  };
  
  // Function to navigate through product images
  const changeProductImage = (productId, direction) => {
    const product = products.find(p => p._id === productId);
    if (!product || !product.images || product.images.length <= 1) return;
    
    const currentIndex = activeImageIndex[productId] || 0;
    const imagesCount = product.images.length;
    
    // Calculate new index with wrapping
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % imagesCount;
    } else {
      newIndex = (currentIndex - 1 + imagesCount) % imagesCount;
    }
    
    setActiveImageIndex({
      ...activeImageIndex,
      [productId]: newIndex
    });
  };

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Products</h1>
          <Button onClick={openAddProductModal}>Add New Product</Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <LoadingSpinner message="Loading products..." />
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {filteredProducts.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Image</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Name</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Category</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Price</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Stock</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product._id}>
                      <td className="py-3 px-4">
                        {product.images && product.images.length > 0 ? (
                          <div className="relative w-16 h-16">
                            <img 
                              src={
                                product.images[activeImageIndex[product._id] || 0]?.includes('http') 
                                  ? product.images[activeImageIndex[product._id] || 0]
                                  : `/uploads/${product.images[activeImageIndex[product._id] || 0]}`
                              } 
                              alt={product.name} 
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-image.png';
                              }}
                            />
                            {product.images.length > 1 && (
                              <div className="absolute inset-0 flex justify-between items-center">
                                <button 
                                  className="bg-black bg-opacity-30 text-white p-1 rounded-full hover:bg-opacity-50 focus:outline-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeProductImage(product._id, 'prev');
                                  }}
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <div className="text-xs bg-gray-800 bg-opacity-70 text-white px-1 rounded">
                                  {(activeImageIndex[product._id] || 0) + 1}/{product.images.length}
                                </div>
                                <button 
                                  className="bg-black bg-opacity-30 text-white p-1 rounded-full hover:bg-opacity-50 focus:outline-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeProductImage(product._id, 'next');
                                  }}
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{product.name}</td>
                      <td className="py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4">${product.price?.toFixed(2)}</td>
                      <td className="py-3 px-4">{product.stock}</td>
                      <td className="py-3 px-4 space-x-2">
                        <button 
                          onClick={() => handleEdit(product._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                        <Link 
                          to={`/admin/products/${product._id}`}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="col-span-2">
              <label className="block mb-1 font-medium">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block mb-1 font-medium">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Category</option>
                <option value="Necklace">Necklace</option>
                <option value="Rings">Rings</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelet">Bracelet</option>
                <option value="Pendant">Pendant</option>
                <option value="Set">Set</option>
              </select>
            </div>
            
            {/* Price */}
            <div>
              <label className="block mb-1 font-medium">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Starting Price */}
            <div>
              <label className="block mb-1 font-medium">Starting Price ($)</label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Stock */}
            <div>
              <label className="block mb-1 font-medium">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Material */}
            <div>
              <label className="block mb-1 font-medium">Material</label>
              <select
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Material</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="Diamond">Diamond</option>
                <option value="Gemstone">Gemstone</option>
              </select>
            </div>
            
            {/* Brand */}
            <div>
              <label className="block mb-1 font-medium">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Color */}
            <div>
              <label className="block mb-1 font-medium">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Weight */}
            <div>
              <label className="block mb-1 font-medium">Weight</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Dimensions */}
            <div>
              <label className="block mb-1 font-medium">Dimensions</label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Attention Level */}
            <div>
              <label className="block mb-1 font-medium">Attention Level</label>
              <select
                name="attentionLevel"
                value={formData.attentionLevel}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Normal">Normal</option>
                <option value="High">High (Featured)</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            {/* Product Images */}
            <div className="col-span-2">
              <label className="block mb-1 font-medium">Product Images</label>
              <input
                type="file"
                name="images"
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="w-full p-2 border border-gray-300 rounded-md"
                required={!selectedProduct}
              />
              {selectedProduct && (
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to keep current images
                </p>
              )}
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Image Previews ({imagePreviews.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-16 h-16 border rounded overflow-hidden">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Description */}
            <div className="col-span-2">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default Products;