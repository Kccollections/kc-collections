import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { getHomePageData } from '../services/realApi';

// Import our new components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import ProductsSection from '../components/home/ProductsSection';
import SpecialOffersSection from '../components/home/SpecialOffersSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ContactSection from '../components/home/ContactSection';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeData, setHomeData] = useState({
    featuredProducts: [],
    newArrivals: [],
    onSaleProducts: [],
    categories: [],
    offers: []
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const data = await getHomePageData();
        setHomeData(data);
      } catch (err) {
        console.error('Failed to load home page data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorDisplay 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </MainLayout>
    );
  }

  // Animation variants for sections
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <MainLayout className="bg-black text-white">
      <div className="premium-dark-theme bg-gradient-to-b from-black to-gray-900">
        {/* Hero Section with animation */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <HeroSection />
        </motion.div>

        {/* Featured Categories with animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="bg-black"
        >
          <CategorySection categories={homeData.categories} />
        </motion.div>

        {/* Featured Products with animation */}
        {homeData.featuredProducts && homeData.featuredProducts.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <ProductsSection
              title="Featured Products"
              subtitle="Our most popular designs and new arrivals"
              products={homeData.featuredProducts}
              backgroundColor="bg-gray-900"
            />
          </motion.div>
        )}

        {/* New Arrivals Section with animation */}
        {homeData.newArrivals && homeData.newArrivals.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <ProductsSection
              title="New Arrivals"
              subtitle="Check out our latest jewelry pieces"
              products={homeData.newArrivals}
              backgroundColor="bg-black"
            />
          </motion.div>
        )}

        {/* Special Offers Section with animation */}
        {homeData.offers && homeData.offers.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <SpecialOffersSection offers={homeData.offers} />
          </motion.div>
        )}

        {/* On Sale Products with animation */}
        {homeData.onSaleProducts && homeData.onSaleProducts.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <ProductsSection
              title="On Sale"
              subtitle="Great deals on beautiful jewelry pieces"
              products={homeData.onSaleProducts}
              backgroundColor="bg-gray-800"
            />
          </motion.div>
        )}

        {/* Contact Section with animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <ContactSection />
        </motion.div>

        {/* Testimonials */}
        {/* <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <TestimonialsSection />
        </motion.div> */}
      </div>
    </MainLayout>
  );
};

export default HomePage;