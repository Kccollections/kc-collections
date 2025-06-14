import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNavigation from '../components/layout/MobileNavigation';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children, className }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className={`flex flex-col min-h-screen bg-gray-900 text-gray-100 ${className || ''}`}>
      <Header/>
      
      {/* Content with page transition */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-grow pb-16 md:pb-0 bg-gray-900"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      {/* Mobile Navigation */}
      <MobileNavigation isActive={isActive} />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};


export default MainLayout;