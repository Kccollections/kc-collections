import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import Button from '../ui/Button';
import Carousel from '../ui/Carousel';
import { motion } from 'framer-motion';

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

  // Animation variants for product cards
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  // Determine text color based on background
  const isDarkBg = backgroundColor.includes('black') || backgroundColor.includes('gray-900') || backgroundColor.includes('gray-800');
  const textColor = isDarkBg ? 'text-white' : 'text-gray-900';
  const subtitleColor = isDarkBg ? 'text-gray-300' : 'text-gray-600';

  return (
    <section className={`${backgroundColor} py-16`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-2 ${textColor}`}>{title}</h2>
          <p className={subtitleColor}>{subtitle}</p>
          <div className="flex justify-center">
            {/* <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4"></div> */}
            <img src="../images/Section line.png" alt="Section line" className="section-line h-12 mt-2" />
          </div>
        </div>
        
        {products.length <= 4 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product._id || product.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                className="transform-gpu"
              >
                <ProductCard 
                  product={adaptProduct(product)} 
                />
              </motion.div>
            ))}
            {showViewAllButton && (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: products.length * 0.1 }}
                className="transform-gpu"
              >
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 border border-gray-700">
                  <Link to="/shop" className="h-full w-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div> 
                    <span className="font-medium text-lg text-white">View All Products</span>
                    <span className="text-sm text-gray-400">See more options</span>
                  </Link>
                </div>
              </motion.div>
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
            {products.map((product, index) => (
              <motion.div
                key={product._id || product.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                className="transform-gpu px-2"
              >
                <ProductCard 
                  product={adaptProduct(product)} 
                />
              </motion.div>
            ))}
            {showViewAllButton && (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: products.length * 0.1 }}
                className="transform-gpu px-2"
              >
                <div className=" h-80 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 border border-gray-700">
                  <Link to="/shop" className="h-full w-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <span className="font-medium text-lg text-white">View All Products</span>
                    <span className="text-sm text-gray-400">See more options</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;