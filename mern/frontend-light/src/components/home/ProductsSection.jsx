import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import Button from '../ui/Button';
import Carousel from '../ui/Carousel';

const ProductsSection = ({ 
  title, 
  subtitle, 
  products, 
  backgroundColor = "bg-gray-50", 
  showViewAllButton = true,
  adaptProductData = true 
}) => {
  const adaptProduct = (product) => {
    if (!adaptProductData) return product;
    
    return {
      id: product._id || product.id,  // Use _id from MongoDB as fallback to id
      name: product.name,
      category: product.category,
      price: product.price,
      salePrice: product.salePrice,
      onSale: product.onSale,
      rating: product.rating,
      reviewCount: product.reviewCount,
      image: product.images && product.images[0],
      isNew: title.toLowerCase().includes('new'),
      stock: product.stock || 10 // Add stock property with default value of 10 if not provided
    };
  };

  return (
    <section className={`${backgroundColor} py-16`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
          <div className="flex justify-center">
            <img src="../images/Section line.png" alt="Section line" className="section-line h-12 mt-2" />
          </div>
        </div>
        
        {products.length <= 4 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={adaptProduct(product)} 
              />
            ))}
            {showViewAllButton && (
              <div className="flex items-center justify-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                <Link to="/shop" className="h-full w-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <span className="font-medium text-lg">View All Products</span>
                  <span className="text-sm text-gray-500">See more options</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Carousel 
            slideToShow={4} 
            autoplay={title.toLowerCase().includes('new')} // Auto-scroll for new arrivals
            autoplaySpeed={4000}
            responsive={[
              { breakpoint: 1024, slidesToShow: 3 },
              { breakpoint: 768, slidesToShow: 2 },
              { breakpoint: 640, slidesToShow: 1 }
            ]}
          >
            {products.map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={adaptProduct(product)} 
              />
            ))}
            {showViewAllButton && (
              <div className="flex items-center justify-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 h-full">
                <Link to="/shop" className="h-full w-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <span className="font-medium text-lg">View All Products</span>
                  <span className="text-sm text-gray-500">See more options</span>
                </Link>
              </div>
            )}
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;