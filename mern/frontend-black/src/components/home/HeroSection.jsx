import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import useSliders from '../../hooks/useSliders';

const HeroSection = () => {
  const { sliders, loading, error } = useSliders();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesCount = sliders.length;
  
  // Move to the next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % slidesCount);
  }, [slidesCount]);

  // Move to the previous slide
  const prevSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + slidesCount) % slidesCount);
  }, [slidesCount]);

  // Handle dot click to navigate to specific slide
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Autoplay functionality
  useEffect(() => {
    if (slidesCount === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [nextSlide, slidesCount]);

  // If there are no sliders, show a fallback hero section
  if (loading) {
    return (
      <section className="relative bg-gray-900 text-white h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-8 w-64 bg-gray-700 rounded mb-4 mx-auto"></div>
          <div className="animate-pulse h-4 w-48 bg-gray-700 rounded mb-4 mx-auto"></div>
          <div className="animate-pulse h-10 w-32 bg-gray-700 rounded mx-auto"></div>
        </div>
      </section>
    );
  }

  if (error || slidesCount === 0) {
    // Fallback hero section if there's an error or no sliders
    return (
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Jewelry collection"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Discover Elegant Jewelry for Every Occasion</h1>
            <p className="text-lg md:text-xl mb-6">Handcrafted jewelry pieces that celebrate your unique beauty and style.</p>
            <div className="flex space-x-4">
              <Button 
                as={Link} 
                to="/shop" 
                size="lg"
              >
                Shop Collection
              </Button>
              <Button 
                as={Link} 
                to="/about" 
                variant="outline" 
                size="lg"
                className="text-white border-white hover:bg-white hover:text-gray-900"
              >
                About Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gray-900 text-white">
      <div className="slider relative h-[500px] md:h-[600px] overflow-hidden">
        {sliders.map((slide, index) => (
          <div 
            key={slide._id || index}
            className={`slide absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 overflow-hidden">
              {/* Display image from server or fallback */}
              <img
                src={slide.img?.startsWith('/uploads') 
                  ? `${import.meta.env.VITE_API_URL}${slide.img}` 
                  : slide.img || "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d"}
                alt={slide.alt || "Slider image"}
                className="w-full h-full object-cover opacity-70"
              />
            </div>
            
            {/* Text overlay */}
            <div className={`relative container mx-auto px-4 py-24 md:py-32 ${
              index % 2 === 0 ? 'text-left' : 'text-right'
            }`}>
              <div className={`max-w-xl ${index % 2 === 0 ? '' : 'ml-auto'}`}>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-6">{slide.description}</p>
                <div className="flex space-x-4">
                  <Button 
                    as={Link} 
                    to={slide.link ? `/shop?search=${encodeURIComponent(slide.link)}` : "/shop"}
                    size="lg"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full"
          aria-label="Previous slide"
        >
          &#10094;
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full"
          aria-label="Next slide"
        >
          &#10095;
        </button>

        {/* Navigation dots */}
        <div className="absolute bottom-6 left-0 right-0 z-20">
          <div className="flex justify-center space-x-2">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 w-3 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;