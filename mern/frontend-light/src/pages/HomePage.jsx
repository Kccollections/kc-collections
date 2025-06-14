import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { getHomePageData } from '../services/api';

// Import our new components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import ProductsSection from '../components/home/ProductsSection';
import SpecialOffersSection from '../components/home/SpecialOffersSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ContactSection from '../components/home/ContactSection';

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

  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories */}
      <CategorySection categories={homeData.categories} />

      {/* Featured Products */}
      {homeData.featuredProducts && homeData.featuredProducts.length > 0 && (
        <ProductsSection
          title="Featured Products"
          subtitle="Our most popular designs and new arrivals"
          products={homeData.featuredProducts}
          backgroundColor="bg-white"
        />
      )}


      {/* New Arrivals Section */}
      {homeData.newArrivals && homeData.newArrivals.length > 0 && (
        <ProductsSection
          title="New Arrivals"
          subtitle="Check out our latest jewelry pieces"
          products={homeData.newArrivals}
          backgroundColor="bg-white"
        />
      )}

      {/* Special Offers Section */}
      {homeData.offers && homeData.offers.length > 0 && (
        <SpecialOffersSection offers={homeData.offers} />
      )}

      {/* On Sale Products */}
      {homeData.onSaleProducts && homeData.onSaleProducts.length > 0 && (
        <ProductsSection
          title="On Sale"
          subtitle="Great deals on beautiful jewelry pieces"
          products={homeData.onSaleProducts}
          backgroundColor="bg-gray-50"
        />
      )}

      {/* Contact Section */}
      <ContactSection />

      {/* Testimonials */}
      {/* <TestimonialsSection /> */}
      
    </MainLayout>
  );
};

export default HomePage;