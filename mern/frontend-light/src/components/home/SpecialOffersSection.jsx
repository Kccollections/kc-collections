import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../ui/Carousel';

const SpecialOffersSection = ({ offers }) => {
  const renderOfferCard = (offer) => (
    <div 
      key={offer.id} 
      className="group relative h-64 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundImage: `url(${offer.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Content overlay with gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
        <div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-200 transition-colors">
            {offer.title}
          </h3>
          <p className="text-gray-800 mb-4 opacity-90 group-hover:opacity-100 transition-opacity">
            {offer.description}
          </p>
        </div>
        
        <div className="space-y-3">
          {offer.discountCode && (
            <div className="bg-opacity-20 backdrop-blur-sm p-3 rounded-md text-center group-hover:bg-opacity-30 transition-all transform group-hover:scale-105">
              <p className="text-sm text-gray-100">Use Code:</p>
              <p className="font-bold text-white">{offer.discountCode}</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button className="text-white font-medium flex items-center bg-purple-600 bg-opacity-60 py-2 px-4 rounded-md group-hover:bg-opacity-90 transition-all">
              Shop Now
              <svg 
                className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-purple-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Special Offers</h2>
          <p className="text-gray-600">Limited time deals you don't want to miss</p>
        </div>
        
        {offers.length <= 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full py-8">
            {offers.map(renderOfferCard)}
          </div>
        ) : (
          <Carousel 
            slideToShow={3} 
            autoplay={true}
            autoplaySpeed={6000}
            responsive={[
              { breakpoint: 1024, slidesToShow: 2 },
              { breakpoint: 768, slidesToShow: 1 }
            ]}
            className="py-8"
          >
            {offers.map(renderOfferCard)}
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default SpecialOffersSection;