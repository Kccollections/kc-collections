import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Carousel from '../ui/Carousel';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorDisplay';

// Base URL for images - adjust this based on your server configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to format image URLs correctly
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.png';
  
  // Handle already complete URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Ensure we have the correct path formatting
  if (imagePath.startsWith('/')) {
    return `${API_URL}${imagePath}`;
  } else {
    return `${API_URL}/${imagePath}`;
  }
};

const CategorySection = ({ categories }) => {
  const navigate = useNavigate();
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories with products on component mount
  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products/categories-with-products`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories (${response.status})`);
        }
        
        const data = await response.json();
        console.log('Categories data:', data); // Log to see the structure
        setCategoriesWithProducts(data);
      } catch (err) {
        console.error('Error loading categories with products:', err);
        setError('Failed to load categories. Please try again later.');
        
        // If API fails, use the prop categories as fallback if available
        if (categories && categories.length > 0) {
          setCategoriesWithProducts(categories);
          setError(null); // Clear error since we have fallback data
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithProducts();
  }, [categories]);

  // Handle redirection to category page
  const redirectToCategory = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  if (loading) {
    return (
      <section className="shop-category py-16">
        <div className="container mx-auto px-4 text-center">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error && (!categoriesWithProducts || categoriesWithProducts.length === 0)) {
    return (
      <section className="shop-category py-16">
        <div className="container mx-auto px-4 text-center">
          <ErrorDisplay message={error} />
        </div>
      </section>
    );
  }

  return (
    <section className="shop-category py-16" id="shop-category">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Shop By Category</h2>
          <p className="text-gray-600 mb-3">Browse your favourite</p>
          <div className="flex justify-center">
            <img src="../images/Section line.png" alt="Section line" className="section-line h-12 mt-2" />
          </div>
        </div>

        <div className="categories grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="categories-container">
          {categoriesWithProducts.map(({ category, product }, index) => {
            // Get the first image URL with proper path
            const imageUrl = product && product.images && product.images.length > 0 
              ? getFullImageUrl(product.images[0])
              : '/images/placeholder.png';
              
            return (
              <div 
                key={index} 
                className="category-item group relative overflow-hidden rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => redirectToCategory(category)}
              >
                <a href="javascript:void(0);" className="explore-link block relative">
                  <div className="aspect-w-1 aspect-h-1">
                    <img 
                      src={imageUrl} 
                      alt={category} 
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
                    <p className="text-xl font-semibold text-white mb-1">{category}</p>
                    <span className="text-sm text-white/80 flex items-center">
                      Explore Now
                      <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;