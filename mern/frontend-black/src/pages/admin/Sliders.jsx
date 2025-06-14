import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import Modal from '../../components/ui/Modal';
import { api } from '../../services/realApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Sliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  
  // Slider form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    alt: '',
    img: null
  });
  
  // State to store image preview
  const [imagePreview, setImagePreview] = useState('');

  // Fetch sliders on component mount
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getAllSliders();
      setSliders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sliders:', error);
      toast.error('Failed to load sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        img: file
      });
      
      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const sliderData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key !== 'img' || (key === 'img' && formData[key])) {
          sliderData.append(key, formData[key]);
        }
      });
      
      if (selectedSlider) {
        // Update existing slider
        await api.admin.updateSlider(selectedSlider._id, sliderData);
        toast.success('Slider updated successfully');
      } else {
        // Create new slider
        await api.admin.createSlider(sliderData);
        toast.success('Slider added successfully');
      }
      
      // Close modal and refresh slider list
      setShowModal(false);
      resetForm();
      fetchSliders();
    } catch (error) {
      console.error('Error saving slider:', error);
      toast.error(selectedSlider ? 'Failed to update slider' : 'Failed to add slider');
    }
  };

  const handleEdit = async (sliderId) => {
    try {
      setLoading(true);
      const slider = await api.admin.getSlider(sliderId);
      
      setSelectedSlider(slider);
      setFormData({
        title: slider.title || '',
        description: slider.description || '',
        link: slider.link || '',
        alt: slider.alt || '',
        img: null
      });
      
      // Set image preview if available
      if (slider.img) {
        setImagePreview(slider.img.startsWith('http') ? slider.img : slider.img);
      } else {
        setImagePreview('');
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching slider details:', error);
      toast.error('Failed to load slider details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sliderId) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        await api.admin.deleteSlider(sliderId);
        toast.success('Slider deleted successfully');
        fetchSliders();
      } catch (error) {
        console.error('Error deleting slider:', error);
        toast.error('Failed to delete slider');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link: '',
      alt: '',
      img: null
    });
    setImagePreview('');
    setSelectedSlider(null);
  };

  const openAddSliderModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Sliders</h1>
          <Button onClick={openAddSliderModal}>Add New Slider</Button>
        </div>

        {/* Sliders Display */}
        {loading ? (
          <LoadingSpinner message="Loading sliders..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliders.length > 0 ? (
              sliders.map((slider) => (
                <div key={slider._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 relative">
                    {slider.img ? (
                      <img 
                        src={slider.img.startsWith('http') ? slider.img : slider.img}
                        alt={slider.alt || 'Slider image'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 truncate">{slider.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{slider.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                          {slider.link ? 'Has Link' : 'No Link'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(slider._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(slider._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No sliders found. Create a new slider to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slider Form Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedSlider ? "Edit Slider" : "Add New Slider"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Title */}
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              ></textarea>
            </div>
            
            {/* Link */}
            <div>
              <label className="block mb-1 font-medium">Button Link</label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Alt Text */}
            <div>
              <label className="block mb-1 font-medium">Image Alt Text</label>
              <input
                type="text"
                name="alt"
                value={formData.alt}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Image */}
            <div>
              <label className="block mb-1 font-medium">Image</label>
              <input
                type="file"
                name="img"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full p-2 border border-gray-300 rounded-md"
                required={!selectedSlider}
              />
              {selectedSlider && (
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to keep current image
                </p>
              )}
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-2">Image Preview</p>
                <div className="h-40 w-full border rounded overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedSlider ? 'Update Slider' : 'Add Slider'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default Sliders;