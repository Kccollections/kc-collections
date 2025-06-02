import React, { useState, useRef, useEffect } from 'react';

const Carousel = ({ 
  children, 
  slideToShow = 4,
  slideToScroll = 1,
  autoplay = false,
  autoplaySpeed = 5000,
  className = '',
  infiniteScroll = true,
  speed = 500,
  responsive = [
    { breakpoint: 1024, slidesToShow: 3 },
    { breakpoint: 768, slidesToShow: 2 },
    { breakpoint: 640, slidesToShow: 1 }
  ]
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(slideToShow);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayTimerRef = useRef(null);
  const containerRef = useRef(null);
  
  // Total number of slides
  const totalSlides = React.Children.count(children);
  
  // Max index that can be scrolled to
  const maxIndex = Math.max(0, totalSlides - slidesToShow);
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      let newSlidesToShow = slideToShow;
      
      for (const item of responsive) {
        if (windowWidth <= item.breakpoint) {
          newSlidesToShow = item.slidesToShow;
          break;
        }
      }
      
      setSlidesToShow(newSlidesToShow);
      // Make sure current index is still valid
      if (currentIndex > totalSlides - newSlidesToShow) {
        setCurrentIndex(Math.max(0, totalSlides - newSlidesToShow));
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [responsive, slideToShow, currentIndex, totalSlides]);
  
  // Autoplay functionality with smoother transitions
  useEffect(() => {
    if (autoplay && totalSlides > slidesToShow) {
      autoplayTimerRef.current = setInterval(() => {
        goToNext();
      }, autoplaySpeed);
    }
    
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplay, autoplaySpeed, currentIndex, slidesToShow, totalSlides]);
  
  const goToPrev = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (currentIndex === 0 && infiniteScroll) {
      // If at the beginning and infinite scrolling is enabled, go to the end
      setCurrentIndex(maxIndex);
    } else {
      setCurrentIndex(prev => Math.max(prev - slideToScroll, 0));
    }
    
    setTimeout(() => setIsTransitioning(false), speed);
  };
  
  const goToNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (currentIndex >= maxIndex && infiniteScroll) {
      // If at the end and infinite scrolling is enabled, go back to the beginning
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => Math.min(prev + slideToScroll, maxIndex));
    }
    
    setTimeout(() => setIsTransitioning(false), speed);
  };
  
  const handleTouchStart = (e) => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }
    setTouchStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      goToNext();
    }
    if (touchEndX - touchStartX > 50) {
      goToPrev();
    }
    
    // Restart autoplay if it was enabled
    if (autoplay && totalSlides > slidesToShow) {
      autoplayTimerRef.current = setInterval(() => {
        goToNext();
      }, autoplaySpeed);
    }
  };
  
  // Determine if we can navigate
  const canGoNext = infiniteScroll || currentIndex < maxIndex;
  const canGoPrev = infiniteScroll || currentIndex > 0;

  // Enhanced visual effect for cycling through products
  const getTranslateValue = () => {
    // Basic translation based on current index
    let translateValue = currentIndex * (100 / slidesToShow);
    
    // Add small oscillation effect for more dynamic movement
    if (autoplay && !isTransitioning) {
      translateValue += Math.sin(Date.now() / 2000) * 0.5; // Subtle oscillation
    }
    
    return `-${translateValue}%`;
  }

  // Early return if not enough items to scroll
  if (totalSlides <= slidesToShow) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(4, totalSlides)} gap-6 ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <div 
        className="overflow-hidden"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(${getTranslateValue()})`,
            width: `${totalSlides * (100 / slidesToShow)}%`,
            transitionDuration: `${speed}ms`
          }}
        >
          {React.Children.map(children, child => (
            <div style={{ width: `${100 / totalSlides}%`, padding: '0 0.5rem' }}>
              {child}
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation arrows - always visible with infinite scrolling */}
      {canGoPrev && (
        <button 
          onClick={goToPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 z-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      )}
      
      {canGoNext && (
        <button 
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-md rounded-full p-2 z-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      )}
      
      {/* Pagination dots with enhanced styling */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: Math.min(maxIndex + 1, 5) }).map((_, index) => {
          // If we have more than 5 pages, use ellipsis for pagination
          const displayIndex = maxIndex > 4 && index === 4 ? maxIndex : index;
          const isActive = maxIndex > 4 && index === 4 
            ? currentIndex >= 4 
            : currentIndex === displayIndex;
            
          return (
            <button
              key={index}
              onClick={() => {
                if (maxIndex > 4 && index === 4) {
                  setCurrentIndex(maxIndex);
                } else {
                  setCurrentIndex(displayIndex);
                }
              }}
              className={`h-2 rounded-full transition-all ${
                isActive ? 'w-6 bg-purple-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${displayIndex + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;