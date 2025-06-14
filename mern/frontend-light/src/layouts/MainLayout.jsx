import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNavigation from '../components/layout/MobileNavigation';

const MainLayout = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      
      {/* Content */}
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation isActive={isActive} />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;